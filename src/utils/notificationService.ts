// Find My Token - Turn Notification & Sound Engine

type AlertListener = (alert: InAppAlert | null) => void;

export interface InAppAlert {
  id: string;
  tokenId: string;
  tokenNumber: string;
  salonName: string;
  estimatedWaitMins: number;
  message: string;
  isTurnNow: boolean;
  timestamp: number;
}

let swRegistration: ServiceWorkerRegistration | null = null;
const alertListeners = new Set<AlertListener>();
let currentActiveAlert: InAppAlert | null = null;
const firedNotificationKeys = new Set<string>();

// Initialize Service Worker for background system notifications
export function initNotificationService(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          swRegistration = reg;
        })
        .catch((err) => {
          console.debug('ServiceWorker registration skipped or failed:', err);
        });
    });
  }
}

// Check notification permission state
export function getNotificationPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission to send system notifications (for lockscreen / background / status bar)
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return false;
  }
}

// Gentle Web Audio API synthesizer for the Turn Alert chime
export function playNotificationChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First Tone: D5 (587.33 Hz) - warm alert harmonic
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.39);

    // Second Tone: A5 (880.00 Hz) - ascending melodic chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.14);
    gain2.gain.setValueAtTime(0, now + 0.14);
    gain2.gain.linearRampToValueAtTime(0.32, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.62);
  } catch (err) {
    console.debug('Web Audio API chime could not play:', err);
  }
}

// Send Turn Notification (both system background and in-app banner)
export async function triggerTurnAlert(alert: InAppAlert): Promise<void> {
  const alertKey = `${alert.tokenId}-${alert.isTurnNow ? 'now' : 'prealert'}`;
  if (firedNotificationKeys.has(alertKey)) {
    return; // Already notified for this milestone
  }
  firedNotificationKeys.add(alertKey);

  // 1. Play chime audio
  playNotificationChime();

  // 2. Trigger haptic vibration on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 250]);
    } catch {
      // Haptics unsupported or disabled
    }
  }

  // 3. System Notification (works in background / lock screen / another tab)
  const title = alert.isTurnNow
    ? `💈 It's Your Turn! Token #${alert.tokenNumber}`
    : `🔔 Turn Approaching: Token #${alert.tokenNumber}`;

  const body = alert.message;

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if (swRegistration && 'showNotification' in swRegistration) {
        await swRegistration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `token-${alert.tokenId}-${alert.isTurnNow ? 'now' : 'prealert'}`,
          data: { url: '/' },
        } as NotificationOptions);
      } else {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `token-${alert.tokenId}-${alert.isTurnNow ? 'now' : 'prealert'}`,
        });
      }
    } catch (e) {
      console.debug('System notification dispatch failed:', e);
    }
  }

  // 4. Update browser tab title to highlight alert
  if (typeof document !== 'undefined') {
    const originalTitle = document.title;
    document.title = `🔔 Token #${alert.tokenNumber}: ${alert.isTurnNow ? 'Ready Now!' : 'Ready Soon!'}`;
    setTimeout(() => {
      document.title = originalTitle;
    }, 15000);
  }

  // 5. Notify in-app banner listeners
  currentActiveAlert = alert;
  alertListeners.forEach((fn) => fn(alert));
}

// In-app alert subscription
export function subscribeToInAppAlerts(listener: AlertListener): () => void {
  alertListeners.add(listener);
  if (currentActiveAlert) {
    listener(currentActiveAlert);
  }
  return () => {
    alertListeners.delete(listener);
  };
}

export function dismissInAppAlert(): void {
  currentActiveAlert = null;
  alertListeners.forEach((fn) => fn(null));
}

export function clearTokenAlertHistory(tokenId: string): void {
  for (const key of Array.from(firedNotificationKeys)) {
    if (key.startsWith(tokenId)) {
      firedNotificationKeys.delete(key);
    }
  }
  if (currentActiveAlert?.tokenId === tokenId) {
    dismissInAppAlert();
  }
}
