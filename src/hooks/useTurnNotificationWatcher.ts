import { useEffect, useRef } from 'react';
import { useAppStore, calculateTokenQueuePosition } from '../store';
import { 
  initNotificationService, 
  triggerTurnAlert, 
  clearTokenAlertHistory 
} from '../utils/notificationService';

export function useTurnNotificationWatcher() {
  const { 
    currentRole,
    activeCustomerToken, 
    queues, 
    salons, 
    reminderMinutes,
    lastFinishActionAt
  } = useAppStore();

  const prevTokenIdRef = useRef<string | null>(null);
  const scheduledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize service worker & audio engine on mount
  useEffect(() => {
    initNotificationService();
  }, []);

  // Watch for token status, turn time progression, and customer reminder schedule
  useEffect(() => {
    // CRITICAL: Pre-alert notifications must be sent ONLY to the customer who owns that active token.
    // Never show/send the customer pre-alert notification inside the Business/Barber dashboard.
    // Do not use the business screen as the notification trigger.
    if (currentRole !== 'customer') {
      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
        scheduledTimerRef.current = null;
      }
      return;
    }

    if (!activeCustomerToken) {
      if (prevTokenIdRef.current) {
        clearTokenAlertHistory(prevTokenIdRef.current);
        prevTokenIdRef.current = null;
      }
      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
        scheduledTimerRef.current = null;
      }
      return;
    }

    prevTokenIdRef.current = activeCustomerToken.id;

    if (activeCustomerToken.status === 'cancelled' || activeCustomerToken.status === 'completed') {
      clearTokenAlertHistory(activeCustomerToken.id);
      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
        scheduledTimerRef.current = null;
      }
      return;
    }

    const salon = salons.find((s) => s.id === activeCustomerToken.salonId);
    const salonQueue = queues[activeCustomerToken.salonId] || [];
    const activeBarbers = salon?.activeBarbersCount || 2;

    // Clear any previous timer before scheduling updated turn time
    if (scheduledTimerRef.current) {
      clearTimeout(scheduledTimerRef.current);
      scheduledTimerRef.current = null;
    }

    // 1. IF ACTUALLY SERVING:
    // When the customer's token starts in chair, notify them that their chair is ready
    if (activeCustomerToken.status === 'serving') {
      triggerTurnAlert({
        id: `serving-${activeCustomerToken.id}`,
        tokenId: activeCustomerToken.id,
        tokenNumber: activeCustomerToken.tokenNumber,
        salonName: salon?.name || activeCustomerToken.salonName || 'Salon',
        estimatedWaitMins: 0,
        message: `Your chair is ready! Please proceed to the barber chair at ${salon?.name || activeCustomerToken.salonName}.`,
        isTurnNow: true,
        timestamp: Date.now(),
      });
      return;
    }

    // 2. IF WAITING IN QUEUE:
    // Calculate estimated turn time based on active barbers and service durations
    if (activeCustomerToken.status === 'waiting') {
      const { estimatedWaitMins, estimatedTurnTimestamp } = calculateTokenQueuePosition(
        activeCustomerToken,
        salonQueue,
        activeBarbers,
        salon
      );

      const targetReminderMins =
        activeCustomerToken.reminderMinutesBefore || reminderMinutes || 10;

      const turnTime = activeCustomerToken.estimatedTurnTimestamp || estimatedTurnTimestamp;
      const scheduledAlertTime = turnTime - (targetReminderMins * 60 * 1000);
      const now = Date.now();

      // Rule: When a barber taps "Done/Finish" on a serving token, do NOT immediately send a notification.
      // The barber may take a short break; wait until the next token actually starts or scheduled alert time arrives.
      const isJustFinished = !!(lastFinishActionAt && (now - lastFinishActionAt < 15000));

      const triggerPreAlert = () => {
        const currentState = useAppStore.getState();
        // Double check customer role and active token state
        if (
          currentState.currentRole !== 'customer' ||
          !currentState.activeCustomerToken ||
          currentState.activeCustomerToken.id !== activeCustomerToken.id ||
          currentState.activeCustomerToken.status !== 'waiting'
        ) {
          return;
        }

        const freshQueue = currentState.queues[activeCustomerToken.salonId] || [];
        const { estimatedWaitMins: freshWaitMins } = calculateTokenQueuePosition(
          currentState.activeCustomerToken,
          freshQueue,
          activeBarbers,
          salon
        );

        triggerTurnAlert({
          id: `prealert-${activeCustomerToken.id}`,
          tokenId: activeCustomerToken.id,
          tokenNumber: activeCustomerToken.tokenNumber,
          salonName: salon?.name || activeCustomerToken.salonName || 'Salon',
          estimatedWaitMins: freshWaitMins,
          message: `Your turn is approaching in ~${freshWaitMins} mins at ${salon?.name || activeCustomerToken.salonName}. Head over to the salon!`,
          isTurnNow: false,
          timestamp: Date.now(),
        });
      };

      if (now >= scheduledAlertTime) {
        // If alert time was reached:
        // Do NOT fire immediately if a barber just finished another token (give buffer for barber break or start)
        if (isJustFinished) {
          const bufferDelay = Math.max(5000, 15000 - (now - lastFinishActionAt));
          scheduledTimerRef.current = setTimeout(triggerPreAlert, bufferDelay);
        } else {
          // Trigger notification at the selected reminder time
          triggerPreAlert();
        }
      } else {
        // Schedule notification to trigger only at the selected reminder time
        const delayMs = scheduledAlertTime - now;
        scheduledTimerRef.current = setTimeout(triggerPreAlert, delayMs);
      }
    }

    // Periodic check to account for background tabs, wakeups, or clock changes
    const interval = setInterval(() => {
      const currentState = useAppStore.getState();
      if (currentState.currentRole !== 'customer' || !currentState.activeCustomerToken) return;
      if (currentState.activeCustomerToken.status !== 'waiting') return;

      const freshQueue = currentState.queues[currentState.activeCustomerToken.salonId] || [];
      const freshToken = currentState.activeCustomerToken;
      const { estimatedTurnTimestamp } = calculateTokenQueuePosition(
        freshToken,
        freshQueue,
        activeBarbers,
        salon
      );

      const targetReminderMins = freshToken.reminderMinutesBefore || reminderMinutes || 10;
      const turnTime = freshToken.estimatedTurnTimestamp || estimatedTurnTimestamp;
      const scheduledAlertTime = turnTime - (targetReminderMins * 60 * 1000);
      const currentTime = Date.now();

      const justFinished = !!(currentState.lastFinishActionAt && (currentTime - currentState.lastFinishActionAt < 15000));

      if (currentTime >= scheduledAlertTime && !justFinished) {
        const { estimatedWaitMins } = calculateTokenQueuePosition(freshToken, freshQueue, activeBarbers, salon);
        triggerTurnAlert({
          id: `prealert-${freshToken.id}`,
          tokenId: freshToken.id,
          tokenNumber: freshToken.tokenNumber,
          salonName: salon?.name || freshToken.salonName || 'Salon',
          estimatedWaitMins,
          message: `Your turn is approaching in ~${estimatedWaitMins} mins at ${salon?.name || freshToken.salonName}. Head over to the salon!`,
          isTurnNow: false,
          timestamp: Date.now(),
        });
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentState = useAppStore.getState();
        if (currentState.currentRole !== 'customer' || !currentState.activeCustomerToken) return;
        if (currentState.activeCustomerToken.status !== 'waiting') return;

        const freshQueue = currentState.queues[currentState.activeCustomerToken.salonId] || [];
        const freshToken = currentState.activeCustomerToken;
        const { estimatedWaitMins, estimatedTurnTimestamp } = calculateTokenQueuePosition(
          freshToken,
          freshQueue,
          activeBarbers,
          salon
        );
        const targetReminderMins = freshToken.reminderMinutesBefore || reminderMinutes || 10;
        const turnTime = freshToken.estimatedTurnTimestamp || estimatedTurnTimestamp;
        const scheduledAlertTime = turnTime - (targetReminderMins * 60 * 1000);
        const currentTime = Date.now();
        const justFinished = !!(currentState.lastFinishActionAt && (currentTime - currentState.lastFinishActionAt < 15000));

        if (currentTime >= scheduledAlertTime && !justFinished) {
          triggerTurnAlert({
            id: `prealert-${freshToken.id}`,
            tokenId: freshToken.id,
            tokenNumber: freshToken.tokenNumber,
            salonName: salon?.name || freshToken.salonName || 'Salon',
            estimatedWaitMins,
            message: `Your turn is approaching in ~${estimatedWaitMins} mins at ${salon?.name || freshToken.salonName}. Head over to the salon!`,
            isTurnNow: false,
            timestamp: Date.now(),
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
        scheduledTimerRef.current = null;
      }
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeCustomerToken, queues, salons, reminderMinutes, currentRole, lastFinishActionAt]);
}
