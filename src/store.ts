import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Salon, QueueToken, Role, Service, Barber, PreviousQueueState, UserSession, TicketColor, AppTab, BusinessType, BusinessAccount } from './types';
import { INITIAL_SALONS, INITIAL_QUEUES, INITIAL_BUSINESS_ACCOUNTS } from './mockData';

export const TICKET_COLOR_CYCLE: TicketColor[] = [
  'orange',
  'pink',
  'yellow',
  'purple',
  'blue',
  'coral',
  'cyan',
];

export function getTokenColor(token: QueueToken | null | undefined): TicketColor {
  if (!token) return 'orange';
  if (token.ticketColor) return token.ticketColor;
  const hash = (token.tokenNumber || token.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TICKET_COLOR_CYCLE[hash % TICKET_COLOR_CYCLE.length];
}

interface AppState {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: UserSession | null;
  currentBusinessType: BusinessType;
  setCurrentBusinessType: (type: BusinessType) => void;
  businessAccounts: BusinessAccount[];
  findBusinessAccount: (phone: string) => BusinessAccount | undefined;
  login: (name: string, phone: string, role: Role, businessType?: BusinessType, businessId?: string) => void;
  logout: () => void;

  // Theme & Role
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Rotating ticket color sequence counter
  tokenColorSequence: number;

  // Salons & Queues
  salons: Salon[];
  queues: Record<string, QueueToken[]>;
  businessSalonId: string;
  setBusinessSalonId: (id: string) => void;

  // Customer State
  activeCustomerToken: QueueToken | null;
  customerPhone: string;
  customerName: string;
  setCustomerDetails: (name: string, phone: string) => void;

  // Queue History for Undo/Revert (Business ⋮ menu)
  lastQueueProgression: {
    salonId: string;
    completedTokenId?: string;
    promotedTokenId?: string;
    previousQueueSnapshot: QueueToken[];
  } | null;
  lastFinishActionAt: number | null;

  // Notification reminder preference (minutes before turn)
  reminderMinutes: number;
  setReminderMinutes: (minutes: number) => void;

  // Category Selection
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;

  // Actions
  createCustomerToken: (salonId: string, services: Service[], customerName: string, customerPhone: string) => { success: boolean; token?: QueueToken; error?: string };
  cancelCustomerToken: (tokenId: string, reason?: string) => void;
  addWalkInToken: (salonId: string, customerName: string, customerPhone: string, serviceIds: string[], barberName?: string) => void;
  advanceQueue: (salonId: string) => { success: boolean; servedToken?: QueueToken; nextToken?: QueueToken };
  revertLastQueueAction: (salonId: string) => { success: boolean; message: string };
  finishCustomerToken: (salonId: string, tokenId: string, barberId: string) => { success: boolean; completedToken?: QueueToken };
  startServingCustomer: (salonId: string, barberId: string, tokenId: string) => { success: boolean; startedToken?: QueueToken };
  toggleBarberActiveStatus: (salonId: string, barberId: string) => void;
  setSalonManualOpenOverride: (salonId: string, isOpen: boolean | null) => void;
  updateSalonSchedule: (salonId: string, openingTime: string, closingTime: string) => void;
  updateSalonDetails: (salonId: string, updates: Partial<Salon>) => void;
  updateSalonServices: (salonId: string, services: Service[]) => void;
  registerNewSalon: (salonData: {
    name: string;
    ownerName: string;
    phone: string;
    registeredPhone?: string;
    ownerPhoto?: string;
    image?: string;
    images?: string[];
    barbersCount: number;
    seatsCount: number;
    locality: string;
    address: string;
    city: string;
    openingTime: string;
    closingTime: string;
    services?: Service[];
    businessType?: BusinessType;
  }) => string;
  toggleSalonOpenStatus: (salonId: string) => void;
  updateActiveBarbersCount: (salonId: string, delta: number) => void;
  resetAllDemoData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      currentBusinessType: 'salon',
      setCurrentBusinessType: (type) => set({ currentBusinessType: type }),
      businessAccounts: INITIAL_BUSINESS_ACCOUNTS,
      findBusinessAccount: (phone: string) => {
        const digits = phone.replace(/[^0-9]/g, '').slice(-10);
        if (!digits) return undefined;
        const state = get();
        // 1. Search in business accounts list
        const account = state.businessAccounts.find(
          (a) => a.rawPhone === digits || a.phone.replace(/[^0-9]/g, '').slice(-10) === digits
        );
        if (account) return account;

        // 2. Search in salons by phone or registeredPhone
        const salon = state.salons.find(
          (s) => (s.registeredPhone && s.registeredPhone.replace(/[^0-9]/g, '').slice(-10) === digits) ||
                 (s.phone && s.phone.replace(/[^0-9]/g, '').slice(-10) === digits)
        );
        if (salon) {
          return {
            id: `acc-${salon.id}`,
            businessName: salon.name,
            ownerName: salon.ownerName || salon.name,
            phone: salon.registeredPhone || salon.phone,
            rawPhone: (salon.registeredPhone || salon.phone).replace(/[^0-9]/g, '').slice(-10),
            businessType: salon.businessType || 'salon',
            salonId: salon.id,
            createdAt: Date.now(),
          };
        }
        return undefined;
      },
      login: (name: string, phone: string, role: Role, businessType?: BusinessType, businessId?: string) => {
        const state = get();
        let resolvedBusinessType = businessType;
        let resolvedSalonId = businessId;

        // Requirement: When a business logs in, check the Business Type saved with that business account
        if (role === 'business') {
          if (!resolvedBusinessType) {
            const acc = get().findBusinessAccount(phone);
            if (acc) {
              resolvedBusinessType = acc.businessType;
              resolvedSalonId = acc.salonId;
            } else {
              resolvedBusinessType = 'salon';
            }
          }
        }

        set({
          isAuthenticated: true,
          currentUser: { 
            name, 
            phone, 
            role, 
            businessType: resolvedBusinessType, 
            businessId: resolvedSalonId 
          },
          currentRole: role,
          currentBusinessType: resolvedBusinessType || 'salon',
          businessSalonId: resolvedSalonId || state.businessSalonId,
          customerName: name,
          customerPhone: phone,
          activeTab: 'home',
          selectedCategory: null,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          activeTab: 'home',
          selectedCategory: null,
        });
      },

      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      currentRole: 'customer',
      setCurrentRole: (role) => set({ currentRole: role }),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Category Selection
      selectedCategory: null,
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      tokenColorSequence: 0,

      salons: INITIAL_SALONS,
      queues: INITIAL_QUEUES,
      businessSalonId: 'salon-royal-fade',
      setBusinessSalonId: (id) => set({ businessSalonId: id }),

      activeCustomerToken: null,
      customerName: 'Rahul Sharma',
      customerPhone: '+91 98765 43210',
      setCustomerDetails: (name, phone) => set({ customerName: name, customerPhone: phone }),

      lastQueueProgression: null,
      lastFinishActionAt: null,
      reminderMinutes: 10,
      setReminderMinutes: (minutes) => {
        set({ reminderMinutes: minutes });
        const { activeCustomerToken } = get();
        if (activeCustomerToken) {
          set({
            activeCustomerToken: {
              ...activeCustomerToken,
              reminderMinutesBefore: minutes,
            },
          });
        }
      },

      createCustomerToken: (salonId, services, customerName, customerPhone) => {
        const state = get();
        // RULE OF SINGULARITY: Exactly ONE active token per customer in V1
        if (state.activeCustomerToken && (state.activeCustomerToken.status === 'waiting' || state.activeCustomerToken.status === 'serving')) {
          return {
            success: false,
            error: 'You already have an active token (' + state.activeCustomerToken.tokenNumber + '). You must complete or cancel your current token before taking a new one.',
          };
        }

        const salon = state.salons.find((s) => s.id === salonId);
        if (!salon || !salon.isOpen) {
          return {
            success: false,
            error: 'This salon is currently closed.',
          };
        }

        const salonQueue = state.queues[salonId] || [];
        const prefix = salon.name.charAt(0).toUpperCase();
        
        // Generate next sequence token number
        const nextNum = salonQueue.length + 1;
        const formattedNum = `${prefix}-${String(nextNum).padStart(2, '0')}`;

        const totalDuration = services.reduce((acc, s) => acc + s.durationMins, 0);
        const totalPrice = services.reduce((acc, s) => acc + s.price, 0);

        // Rotating Ticket Color Sequence: Orange -> Pink -> Yellow -> Purple -> Blue -> Coral -> Cyan
        const assignedColor = TICKET_COLOR_CYCLE[state.tokenColorSequence % TICKET_COLOR_CYCLE.length];

        const newToken: QueueToken = {
          id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          tokenNumber: formattedNum,
          ticketColor: assignedColor,
          salonId: salon.id,
          salonName: salon.name,
          customerName: customerName.trim() || 'Guest Customer',
          customerPhone: customerPhone.trim() || '+91 98765 43210',
          services,
          totalDurationMins: totalDuration,
          totalPrice,
          status: 'waiting',
          createdAt: Date.now(),
          reminderMinutesBefore: state.reminderMinutes,
        };

        const updatedQueue = recalculateQueueEstimatedTimes(
          [...salonQueue, newToken],
          salon.barbers,
          state.reminderMinutes
        );
        const finalNewToken = updatedQueue.find((t) => t.id === newToken.id) || newToken;

        set({
          queues: {
            ...state.queues,
            [salonId]: updatedQueue,
          },
          activeCustomerToken: finalNewToken,
          activeTab: 'token',
          customerName: customerName.trim() || state.customerName,
          customerPhone: customerPhone.trim() || state.customerPhone,
          tokenColorSequence: state.tokenColorSequence + 1,
        });

        return { success: true, token: finalNewToken };
      },

      cancelCustomerToken: (tokenId, reason) => {
        const state = get();
        const active = state.activeCustomerToken;
        if (active && active.id === tokenId) {
          const salonId = active.salonId;
          const salonQueue = state.queues[salonId] || [];
          
          // ZERO PHANTOM DATA: Cancelled tokens must NEVER reappear as active
          const updatedQueue = salonQueue.map((tok) =>
            tok.id === tokenId ? { ...tok, status: 'cancelled' as const } : tok
          );

          set({
            activeCustomerToken: null,
            queues: {
              ...state.queues,
              [salonId]: updatedQueue,
            },
          });
        }
      },

      addWalkInToken: (salonId, customerName, customerPhone, serviceIds, barberName) => {
        const state = get();
        const salon = state.salons.find((s) => s.id === salonId);
        if (!salon) return;

        const selectedServices = salon.services.filter((s) => serviceIds.includes(s.id));
        const finalServices = selectedServices.length > 0 ? selectedServices : [salon.services[0]];

        const salonQueue = state.queues[salonId] || [];
        const prefix = salon.name.charAt(0).toUpperCase();
        const nextNum = salonQueue.length + 1;
        const formattedNum = `${prefix}-${String(nextNum).padStart(2, '0')}`;

        const totalDuration = finalServices.reduce((acc, s) => acc + s.durationMins, 0);
        const totalPrice = finalServices.reduce((acc, s) => acc + s.price, 0);

        const assignedColor = TICKET_COLOR_CYCLE[state.tokenColorSequence % TICKET_COLOR_CYCLE.length];

        const newWalkInToken: QueueToken = {
          id: `walkin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          tokenNumber: formattedNum,
          ticketColor: assignedColor,
          salonId: salon.id,
          salonName: salon.name,
          customerName: customerName.trim() || 'Walk-in Customer',
          customerPhone: customerPhone.trim() || '+91 00000 00000',
          services: finalServices,
          totalDurationMins: totalDuration,
          totalPrice,
          status: 'waiting',
          isWalkIn: true,
          barberName: barberName || undefined,
          createdAt: Date.now(),
        };

        set({
          queues: {
            ...state.queues,
            [salonId]: [...salonQueue, newWalkInToken],
          },
          tokenColorSequence: state.tokenColorSequence + 1,
        });
      },

      advanceQueue: (salonId) => {
        const state = get();
        const salonQueue = state.queues[salonId] || [];
        const snapshot = JSON.parse(JSON.stringify(salonQueue));

        // Find active/serving tokens and waiting tokens
        const currentlyServing = salonQueue.filter((t) => t.status === 'serving');
        const waitingTokens = salonQueue.filter((t) => t.status === 'waiting');

        if (currentlyServing.length === 0 && waitingTokens.length === 0) {
          return { success: false };
        }

        let completedToken: QueueToken | undefined;
        let promotedToken: QueueToken | undefined;

        // If someone is serving, complete the oldest serving one
        if (currentlyServing.length > 0) {
          completedToken = currentlyServing[0];
        }

        // The next in line becomes 'serving'
        if (waitingTokens.length > 0) {
          promotedToken = waitingTokens[0];
        }

        const updatedQueue = salonQueue.map((token) => {
          if (completedToken && token.id === completedToken.id) {
            return {
              ...token,
              status: 'completed' as const,
              completedAt: Date.now(),
            };
          }
          if (promotedToken && token.id === promotedToken.id) {
            return {
              ...token,
              status: 'serving' as const,
              startedAt: Date.now(),
            };
          }
          return token;
        });

        // Also update customer's active token if it was affected
        let updatedCustomerToken = state.activeCustomerToken;
        if (updatedCustomerToken && updatedCustomerToken.salonId === salonId) {
          if (completedToken && updatedCustomerToken.id === completedToken.id) {
            // Completed! Per Rule of Singularity and Zero Phantom Data, customer turn is finished
            updatedCustomerToken = {
              ...updatedCustomerToken,
              status: 'completed',
              completedAt: Date.now(),
            };
          } else if (promotedToken && updatedCustomerToken.id === promotedToken.id) {
            updatedCustomerToken = {
              ...updatedCustomerToken,
              status: 'serving',
              startedAt: Date.now(),
            };
          }
        }

        set({
          queues: {
            ...state.queues,
            [salonId]: updatedQueue,
          },
          activeCustomerToken: updatedCustomerToken,
          lastQueueProgression: {
            salonId,
            completedTokenId: completedToken?.id,
            promotedTokenId: promotedToken?.id,
            previousQueueSnapshot: snapshot,
          },
        });

        return {
          success: true,
          servedToken: completedToken,
          nextToken: promotedToken,
        };
      },

      revertLastQueueAction: (salonId) => {
        const state = get();
        const lastAction = state.lastQueueProgression;
        if (!lastAction || lastAction.salonId !== salonId) {
          return { success: false, message: 'No prior queue action available to revert.' };
        }

        // Restore snapshot
        const restoredQueue = lastAction.previousQueueSnapshot;

        // Also sync customer active token if needed
        let updatedCustomerToken = state.activeCustomerToken;
        if (updatedCustomerToken && updatedCustomerToken.salonId === salonId) {
          const matchingInSnapshot = restoredQueue.find((t) => t.id === updatedCustomerToken?.id);
          if (matchingInSnapshot) {
            updatedCustomerToken = matchingInSnapshot;
          }
        }

        set({
          queues: {
            ...state.queues,
            [salonId]: restoredQueue,
          },
          activeCustomerToken: updatedCustomerToken,
          lastQueueProgression: null, // Only allows reverting immediate prior action
        });

        return { success: true, message: 'Successfully reverted queue advancement.' };
      },

      finishCustomerToken: (salonId, tokenId, barberId) => {
        const state = get();
        const salonQueue = state.queues[salonId] || [];
        const snapshot = JSON.parse(JSON.stringify(salonQueue));

        const targetToken = salonQueue.find((t) => t.id === tokenId);
        if (!targetToken) {
          return { success: false };
        }

        // 1. Mark target token as completed
        const completedQueue = salonQueue.map((t) => {
          if (t.id === tokenId) {
            return {
              ...t,
              status: 'completed' as const,
              completedAt: Date.now(),
            };
          }
          return t;
        });

        // 2. Update salon barbers: mark this barber as available (taking break/ready for next)
        const targetSalon = state.salons.find((s) => s.id === salonId);
        const updatedBarbers = targetSalon?.barbers.map((b) =>
          b.id === barberId ? { ...b, isAvailable: true } : b
        ) || [];

        const updatedSalons = state.salons.map((salon) => {
          if (salon.id === salonId) {
            return {
              ...salon,
              barbers: updatedBarbers,
            };
          }
          return salon;
        });

        // 3. Recalculate queue and estimated wait time based on actual active barbers and service time
        // The barber may take a short break, so we don't assume the next token starts immediately.
        const recalculatedQueue = recalculateQueueEstimatedTimes(
          completedQueue,
          updatedBarbers,
          state.reminderMinutes
        );

        // 4. Update customer active token if matching
        let updatedCustomerToken = state.activeCustomerToken;
        if (updatedCustomerToken && updatedCustomerToken.id === tokenId) {
          updatedCustomerToken = {
            ...updatedCustomerToken,
            status: 'completed',
            completedAt: Date.now(),
          };
        } else if (updatedCustomerToken && updatedCustomerToken.salonId === salonId) {
          const freshToken = recalculatedQueue.find((t) => t.id === updatedCustomerToken?.id);
          if (freshToken) {
            updatedCustomerToken = {
              ...updatedCustomerToken,
              estimatedTurnTimestamp: freshToken.estimatedTurnTimestamp,
              scheduledAlertTimestamp: freshToken.scheduledAlertTimestamp,
            };
          }
        }

        // 5. Update state and record lastFinishActionAt (used to suppress premature notification firing on finish)
        set({
          queues: {
            ...state.queues,
            [salonId]: recalculatedQueue,
          },
          salons: updatedSalons,
          activeCustomerToken: updatedCustomerToken,
          lastFinishActionAt: Date.now(),
          lastQueueProgression: {
            salonId,
            completedTokenId: tokenId,
            previousQueueSnapshot: snapshot,
          },
        });

        return { success: true, completedToken: targetToken };
      },

      startServingCustomer: (salonId, barberId, tokenId) => {
        const state = get();
        const salonQueue = state.queues[salonId] || [];
        const snapshot = JSON.parse(JSON.stringify(salonQueue));

        const salon = state.salons.find((s) => s.id === salonId);
        const barber = salon?.barbers.find((b) => b.id === barberId);

        const targetToken = salonQueue.find((t) => t.id === tokenId);
        if (!targetToken) {
          return { success: false };
        }

        // 1. Mark target token as serving with current start timestamp
        const now = Date.now();
        const servingQueue = salonQueue.map((t) => {
          if (t.id === tokenId) {
            return {
              ...t,
              status: 'serving' as const,
              startedAt: now,
              assignedBarberId: barberId,
              barberName: barber?.name || t.barberName || 'Barber',
            };
          }
          return t;
        });

        // 2. Mark this barber as not available (currently occupied)
        const updatedBarbers = salon?.barbers.map((b) =>
          b.id === barberId ? { ...b, isAvailable: false } : b
        ) || [];

        const updatedSalons = state.salons.map((s) => {
          if (s.id === salonId) {
            return {
              ...s,
              barbers: updatedBarbers,
            };
          }
          return s;
        });

        // 3. When the next token actually starts/is assigned to the chair,
        // update its estimated turn time and recalculate all remaining waiting tokens
        const recalculatedQueue = recalculateQueueEstimatedTimes(
          servingQueue,
          updatedBarbers,
          state.reminderMinutes
        );

        // 4. Update customer token if matching
        let updatedCustomerToken = state.activeCustomerToken;
        if (updatedCustomerToken && updatedCustomerToken.id === tokenId) {
          updatedCustomerToken = {
            ...updatedCustomerToken,
            status: 'serving',
            startedAt: now,
            assignedBarberId: barberId,
            barberName: barber?.name || 'Barber',
          };
        } else if (updatedCustomerToken && updatedCustomerToken.salonId === salonId) {
          const freshToken = recalculatedQueue.find((t) => t.id === updatedCustomerToken?.id);
          if (freshToken) {
            updatedCustomerToken = {
              ...updatedCustomerToken,
              estimatedTurnTimestamp: freshToken.estimatedTurnTimestamp,
              scheduledAlertTimestamp: freshToken.scheduledAlertTimestamp,
            };
          }
        }

        set({
          queues: {
            ...state.queues,
            [salonId]: recalculatedQueue,
          },
          salons: updatedSalons,
          activeCustomerToken: updatedCustomerToken,
          lastFinishActionAt: null, // Clear finish action since chair has actively started
          lastQueueProgression: {
            salonId,
            promotedTokenId: tokenId,
            previousQueueSnapshot: snapshot,
          },
        });

        return { success: true, startedToken: targetToken };
      },

      toggleBarberActiveStatus: (salonId, barberId) => {
        set((state) => {
          let updatedBarbers: Barber[] = [];
          const updatedSalons = state.salons.map((salon) => {
            if (salon.id === salonId) {
              updatedBarbers = salon.barbers.map((b) =>
                b.id === barberId ? { ...b, isActive: !b.isActive } : b
              );
              const activeCount = updatedBarbers.filter((b) => b.isActive).length;
              return {
                ...salon,
                barbers: updatedBarbers,
                activeBarbersCount: Math.max(1, activeCount),
              };
            }
            return salon;
          });

          const currentSalonQueue = state.queues[salonId] || [];
          const recalculatedQueue = recalculateQueueEstimatedTimes(
            currentSalonQueue,
            updatedBarbers,
            state.reminderMinutes
          );

          let updatedCustomerToken = state.activeCustomerToken;
          if (updatedCustomerToken && updatedCustomerToken.salonId === salonId) {
            const fresh = recalculatedQueue.find((t) => t.id === updatedCustomerToken?.id);
            if (fresh) {
              updatedCustomerToken = {
                ...updatedCustomerToken,
                estimatedTurnTimestamp: fresh.estimatedTurnTimestamp,
                scheduledAlertTimestamp: fresh.scheduledAlertTimestamp,
              };
            }
          }

          return {
            salons: updatedSalons,
            queues: {
              ...state.queues,
              [salonId]: recalculatedQueue,
            },
            activeCustomerToken: updatedCustomerToken,
          };
        });
      },

      setSalonManualOpenOverride: (salonId, isOpen) => {
        set((state) => ({
          salons: state.salons.map((s) => {
            if (s.id === salonId) {
              if (isOpen === null) {
                return {
                  ...s,
                  isManualOverride: false,
                  manualOpenStatus: undefined,
                };
              }
              return {
                ...s,
                isManualOverride: true,
                manualOpenStatus: isOpen,
                isOpen,
              };
            }
            return s;
          }),
        }));
      },

      updateSalonSchedule: (salonId, openingTime, closingTime) => {
        set((state) => ({
          salons: state.salons.map((s) => {
            if (s.id === salonId) {
              return {
                ...s,
                openingTime,
                closingTime,
                openingHours: `${openingTime} – ${closingTime}`,
              };
            }
            return s;
          }),
        }));
      },

      updateSalonDetails: (salonId, updates) => {
        set((state) => ({
          salons: state.salons.map((s) => (s.id === salonId ? { ...s, ...updates } : s)),
        }));
      },

      updateSalonServices: (salonId, services) => {
        set((state) => ({
          salons: state.salons.map((s) => (s.id === salonId ? { ...s, services } : s)),
        }));
      },

      registerNewSalon: (salonData) => {
        const state = get();
        const newSalonId = `salon-${Date.now()}`;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const sampleBarberPhotos = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
        ];

        const barbers = Array.from({ length: salonData.barbersCount }, (_, i) => ({
          id: `barber-${newSalonId}-${i + 1}`,
          name: `Barber ${letters[i] || i + 1}`,
          avatar: '✂️',
          photo: sampleBarberPhotos[i % sampleBarberPhotos.length],
          isActive: true,
          isAvailable: true,
          barberNumber: `Barber ${letters[i] || i + 1}`,
          seatNumber: i + 1,
        }));

        const registeredBusinessType = salonData.businessType || 'salon';
        const cleanDigits = (salonData.registeredPhone || salonData.phone).replace(/[^0-9]/g, '').slice(-10);

        const newSalon: Salon = {
          id: newSalonId,
          businessType: registeredBusinessType,
          name: salonData.name,
          tagline: registeredBusinessType === 'salon' 
            ? 'Professional grooming & styling studio' 
            : `${salonData.name} - Official Token Desk`,
          ownerName: salonData.ownerName,
          phone: salonData.phone,
          registeredPhone: salonData.registeredPhone || salonData.phone,
          ownerPhoto: salonData.ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          image: salonData.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
          images: salonData.images || [salonData.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80'],
          locality: salonData.locality,
          address: salonData.address,
          city: salonData.city,
          rating: 5.0,
          totalReviews: 1,
          isOpen: true,
          openingHours: `${salonData.openingTime} – ${salonData.closingTime}`,
          openingTime: salonData.openingTime,
          closingTime: salonData.closingTime,
          activeBarbersCount: salonData.barbersCount,
          seatsCount: salonData.seatsCount,
          barbers,
          services: salonData.services && salonData.services.length > 0 ? salonData.services : [
            {
              id: `srv-${newSalonId}-1`,
              name: 'Haircut',
              category: 'Hair',
              durationMins: 30,
              price: 100,
              description: 'Classic precision haircut & styling',
            },
            {
              id: `srv-${newSalonId}-2`,
              name: 'Beard',
              category: 'Beard',
              durationMins: 15,
              price: 40,
              description: 'Beard trim, shape & grooming',
            },
            {
              id: `srv-${newSalonId}-3`,
              name: 'Haircut + Beard',
              category: 'Hair',
              durationMins: 45,
              price: 140,
              description: 'Complete haircut + beard grooming combo',
            },
            {
              id: `srv-${newSalonId}-4`,
              name: 'Facial',
              category: 'Spa',
              durationMins: 45,
              price: 200,
              description: 'Refreshing facial cleansing & treatment',
            },
          ],
        };

        const newAccount: BusinessAccount = {
          id: `acc-${newSalonId}`,
          businessName: salonData.name,
          ownerName: salonData.ownerName,
          phone: salonData.registeredPhone || salonData.phone,
          rawPhone: cleanDigits,
          businessType: registeredBusinessType,
          salonId: newSalonId,
          createdAt: Date.now(),
        };

        set({
          salons: [newSalon, ...state.salons],
          businessAccounts: [
            newAccount,
            ...state.businessAccounts.filter((a) => a.rawPhone !== cleanDigits),
          ],
          queues: {
            ...state.queues,
            [newSalonId]: [],
          },
          businessSalonId: newSalonId,
          currentBusinessType: registeredBusinessType,
          currentUser: {
            name: salonData.ownerName,
            phone: salonData.registeredPhone || salonData.phone,
            role: 'business',
            businessType: registeredBusinessType,
            businessId: newSalonId,
          },
        });

        return newSalonId;
      },

      toggleSalonOpenStatus: (salonId) => {
        set((state) => ({
          salons: state.salons.map((s) => (s.id === salonId ? { ...s, isOpen: !s.isOpen } : s)),
        }));
      },

      updateActiveBarbersCount: (salonId, delta) => {
        set((state) => ({
          salons: state.salons.map((s) => {
            if (s.id === salonId) {
              const count = Math.max(1, Math.min(10, s.activeBarbersCount + delta));
              return { ...s, activeBarbersCount: count };
            }
            return s;
          }),
        }));
      },

      resetAllDemoData: () => {
        set({
          salons: INITIAL_SALONS,
          queues: INITIAL_QUEUES,
          activeCustomerToken: null,
          lastQueueProgression: null,
          tokenColorSequence: 0,
        });
      },
    }),
    {
      name: 'find-my-token-storage-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        currentRole: state.currentRole,
        isDarkMode: state.isDarkMode,
        activeTab: state.activeTab,
        salons: state.salons,
        queues: state.queues,
        businessSalonId: state.businessSalonId,
        activeCustomerToken: state.activeCustomerToken,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        lastQueueProgression: state.lastQueueProgression,
        reminderMinutes: state.reminderMinutes,
        tokenColorSequence: state.tokenColorSequence,
        // Notice: selectedCategory is omitted so next app launch always opens Category Screen directly!
      }),
    }
  )
);

// Helper to recalculate queue tokens with realistic multi-barber chair scheduling
export function recalculateQueueEstimatedTimes(
  queue: QueueToken[],
  salonBarbers: Barber[],
  defaultReminderMins = 10
): QueueToken[] {
  const now = Date.now();
  const currentlyServing = queue.filter((t) => t.status === 'serving');
  const waitingTokens = queue.filter((t) => t.status === 'waiting');

  const activeBarbers = salonBarbers && salonBarbers.length > 0
    ? salonBarbers.filter((b) => b.isActive !== false)
    : [{ id: 'b1', name: 'Barber 1', avatar: '', isActive: true, isAvailable: true }];
  
  const numBarbers = Math.max(1, activeBarbers.length);

  // Track availability timestamp for each active chair/barber
  const chairFreeTimes: number[] = [];

  activeBarbers.forEach((barber) => {
    const servingTok = currentlyServing.find(
      (t) => t.assignedBarberId === barber.id || t.barberName === barber.name
    );
    if (servingTok) {
      const durationMs = (servingTok.totalDurationMins || 25) * 60 * 1000;
      const started = servingTok.startedAt || now;
      const finishesAt = started + durationMs;
      // Minimum 2 minutes buffer if service is near or over estimated duration
      chairFreeTimes.push(Math.max(now + 2 * 60 * 1000, finishesAt));
    } else {
      // Chair is idle or barber just finished.
      // The barber may take a short break (e.g. 2.5 minutes buffer)
      chairFreeTimes.push(now + 2.5 * 60 * 1000);
    }
  });

  while (chairFreeTimes.length < numBarbers) {
    chairFreeTimes.push(now + 2.5 * 60 * 1000);
  }

  // Calculate updated timestamps for waiting tokens
  const waitingTokenUpdates = new Map<string, { turnTime: number; scheduledAlert: number; waitMins: number }>();

  waitingTokens.forEach((tok) => {
    let earliestIdx = 0;
    let earliestTime = chairFreeTimes[0];
    for (let c = 1; c < chairFreeTimes.length; c++) {
      if (chairFreeTimes[c] < earliestTime) {
        earliestTime = chairFreeTimes[c];
        earliestIdx = c;
      }
    }

    const assignedStart = Math.max(now, earliestTime);
    const durationMs = (tok.totalDurationMins || 25) * 60 * 1000;
    chairFreeTimes[earliestIdx] = assignedStart + durationMs;

    const reminderMins = tok.reminderMinutesBefore || defaultReminderMins;
    const scheduledAlert = assignedStart - (reminderMins * 60 * 1000);
    const waitMins = Math.max(1, Math.round((assignedStart - now) / (60 * 1000)));

    waitingTokenUpdates.set(tok.id, {
      turnTime: assignedStart,
      scheduledAlert,
      waitMins,
    });
  });

  return queue.map((tok) => {
    if (tok.status === 'waiting' && waitingTokenUpdates.has(tok.id)) {
      const update = waitingTokenUpdates.get(tok.id)!;
      return {
        ...tok,
        estimatedTurnTimestamp: update.turnTime,
        scheduledAlertTimestamp: update.scheduledAlert,
      };
    }
    return tok;
  });
}

// Helper calculation: Dynamic waiting time
// Wait Time = (Sum of service durations of people ahead) / (Active barbers)
export function calculateTokenQueuePosition(
  token: QueueToken,
  queue: QueueToken[],
  activeBarbersCount: number,
  salon?: Salon
): {
  peopleAhead: number;
  estimatedWaitMins: number;
  currentlyServing: QueueToken[];
  estimatedTurnTimestamp: number;
  scheduledAlertTimestamp: number;
} {
  const now = Date.now();
  const currentlyServing = queue.filter((t) => t.status === 'serving');
  const waitingTokens = queue.filter((t) => t.status === 'waiting');

  if (token.status === 'serving') {
    return {
      peopleAhead: 0,
      estimatedWaitMins: 0,
      currentlyServing,
      estimatedTurnTimestamp: token.startedAt || now,
      scheduledAlertTimestamp: now,
    };
  }

  if (token.status === 'completed' || token.status === 'cancelled') {
    return {
      peopleAhead: 0,
      estimatedWaitMins: 0,
      currentlyServing,
      estimatedTurnTimestamp: token.completedAt || now,
      scheduledAlertTimestamp: now,
    };
  }

  const tokenIndex = waitingTokens.findIndex((t) => t.id === token.id);
  if (tokenIndex === -1) {
    return {
      peopleAhead: 0,
      estimatedWaitMins: 0,
      currentlyServing,
      estimatedTurnTimestamp: now,
      scheduledAlertTimestamp: now,
    };
  }

  const barbers = salon?.barbers || [];
  const activeBarbers = barbers.length > 0
    ? barbers.filter((b) => b.isActive !== false)
    : Array.from({ length: Math.max(1, activeBarbersCount) }, (_, i) => ({
        id: `b-${i}`,
        name: `Barber ${i + 1}`,
        avatar: '',
        isActive: true,
        isAvailable: true,
      }));

  const numBarbers = Math.max(1, activeBarbers.length);

  const chairFreeTimes: number[] = [];
  activeBarbers.forEach((barber) => {
    const servingTok = currentlyServing.find(
      (t) => t.assignedBarberId === barber.id || t.barberName === barber.name
    );
    if (servingTok) {
      const durationMs = (servingTok.totalDurationMins || 25) * 60 * 1000;
      const started = servingTok.startedAt || now;
      const finishesAt = started + durationMs;
      chairFreeTimes.push(Math.max(now + 2 * 60 * 1000, finishesAt));
    } else {
      // Chair is idle or barber just finished. Barber may take a short break (2.5 mins buffer)
      chairFreeTimes.push(now + 2.5 * 60 * 1000);
    }
  });

  while (chairFreeTimes.length < numBarbers) {
    chairFreeTimes.push(now + 2.5 * 60 * 1000);
  }

  let tokenStartTime = now;

  for (let i = 0; i <= tokenIndex; i++) {
    const waitingTok = waitingTokens[i];
    let earliestIdx = 0;
    let earliestTime = chairFreeTimes[0];
    for (let c = 1; c < chairFreeTimes.length; c++) {
      if (chairFreeTimes[c] < earliestTime) {
        earliestTime = chairFreeTimes[c];
        earliestIdx = c;
      }
    }

    const assignedStart = Math.max(now, earliestTime);
    const durationMs = (waitingTok.totalDurationMins || 25) * 60 * 1000;
    chairFreeTimes[earliestIdx] = assignedStart + durationMs;

    if (i === tokenIndex) {
      tokenStartTime = assignedStart;
    }
  }

  const estimatedWaitMins = Math.max(1, Math.round((tokenStartTime - now) / (60 * 1000)));
  const reminderMins = token.reminderMinutesBefore || 10;
  const scheduledAlertTimestamp = tokenStartTime - (reminderMins * 60 * 1000);

  return {
    peopleAhead: tokenIndex,
    estimatedWaitMins,
    currentlyServing,
    estimatedTurnTimestamp: tokenStartTime,
    scheduledAlertTimestamp,
  };
}
