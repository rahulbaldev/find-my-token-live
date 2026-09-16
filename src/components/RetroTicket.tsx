import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, calculateTokenQueuePosition, getTokenColor } from '../store';
import { QueueToken, TicketColor } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  playNotificationChime 
} from '../utils/notificationService';
import { 
  Clock, 
  Users, 
  Scissors, 
  Bell, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Phone,
  Sparkles,
  MoreVertical,
  Home,
  CreditCard,
  X,
  BellRing,
  Sliders
} from 'lucide-react';

interface RetroTicketProps {
  token: QueueToken;
  onExploreSalons?: () => void;
}

interface TicketThemeStyle {
  light: {
    bg: string;
    border: string;
    dashedBorder: string;
    subtitleColor: string;
    numberColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    reminderColor: string;
  };
  dark: {
    bg: string;
    border: string;
    dashedBorder: string;
    subtitleColor: string;
    numberColor: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    reminderColor: string;
  };
}

// 7-Color Rotation System: Orange -> Pink -> Yellow -> Purple -> Blue -> Coral -> Cyan
const TICKET_STYLES: Record<TicketColor, TicketThemeStyle> = {
  orange: {
    light: {
      bg: 'bg-gradient-to-br from-orange-400 to-amber-500', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-orange-500 to-amber-600', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  pink: {
    light: {
      bg: 'bg-gradient-to-br from-pink-400 to-rose-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-pink-500 to-rose-600', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  yellow: {
    light: {
      bg: 'bg-gradient-to-br from-amber-400 to-orange-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-500', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  purple: {
    light: {
      bg: 'bg-gradient-to-br from-purple-400 to-indigo-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-purple-500 to-indigo-500', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  blue: {
    light: {
      bg: 'bg-gradient-to-br from-blue-400 to-cyan-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  coral: {
    light: {
      bg: 'bg-gradient-to-br from-rose-400 to-red-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-rose-500 to-red-600', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
  cyan: {
    light: {
      bg: 'bg-gradient-to-br from-cyan-400 to-teal-400', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
    dark: {
      bg: 'bg-gradient-to-br from-cyan-500 to-teal-600', border: 'border-white/10', dashedBorder: 'border-white/30',
      subtitleColor: 'text-white/90', numberColor: 'text-white',
      badgeBg: 'bg-black/30', badgeText: 'text-white', badgeBorder: 'border-transparent',
      reminderColor: 'text-white/80',
    },
  },
};

export const RetroTicket: React.FC<RetroTicketProps> = ({ token, onExploreSalons }) => {
  const { 
    salons, 
    queues, 
    cancelCustomerToken, 
    reminderMinutes, 
    setReminderMinutes, 
    isDarkMode,
    setActiveTab
  } = useAppStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showSalonDetailsModal, setShowSalonDetailsModal] = useState(false);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderSavedAlert, setReminderSavedAlert] = useState(false);

  const isPresetMinutes = [5, 10, 15].includes(reminderMinutes);
  const [showCustomInput, setShowCustomInput] = useState(!isPresetMinutes);
  const [customMinutesVal, setCustomMinutesVal] = useState<number>(
    !isPresetMinutes ? reminderMinutes : 20
  );
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission()
  );

  const menuRef = useRef<HTMLDivElement>(null);

  // Sync custom input state with store reminderMinutes
  useEffect(() => {
    if (![5, 10, 15].includes(reminderMinutes)) {
      setCustomMinutesVal(reminderMinutes);
    }
  }, [reminderMinutes]);

  // Close options menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showOptionsMenu]);

  const salon = salons.find((s) => s.id === token.salonId);
  const salonQueue = queues[token.salonId] || [];
  const activeBarbers = salon?.activeBarbersCount || 2;

  // Calculate live position
  const { peopleAhead, estimatedWaitMins, currentlyServing } = calculateTokenQueuePosition(
    token,
    salonQueue,
    activeBarbers,
    salon
  );

  const handleReminderChange = async (minutes: number) => {
    const validMinutes = Math.max(1, Math.min(120, Math.round(minutes)));
    setReminderMinutes(validMinutes);
    setShowReminderPicker(false);
    setReminderSavedAlert(true);
    playNotificationChime();

    // Check & request browser notification permission for background execution
    if (getNotificationPermission() === 'default') {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted ? 'granted' : 'denied');
    } else {
      setNotificationPermission(getNotificationPermission());
    }

    setTimeout(() => setReminderSavedAlert(false), 3000);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      playNotificationChime();
    }
  };

  const handleConfirmCancel = () => {
    cancelCustomerToken(token.id);
    setShowCancelModal(false);
  };

  const isServing = token.status === 'serving';
  const isWaiting = token.status === 'waiting';
  const isCompleted = token.status === 'completed';
  const isCancelled = token.status === 'cancelled';

  const servingTokenNumbers = currentlyServing.map((t) => t.tokenNumber).join(', ');

  // Sequential rotating ticket color resolution
  const assignedColor = getTokenColor(token);
  const theme = TICKET_STYLES[assignedColor] || TICKET_STYLES.orange;
  const currentStyle = isDarkMode ? theme.dark : theme.light;

  return (
    <div className="w-full flex flex-col items-center select-none py-2 animate-in fade-in duration-200">
      {/* Three-Dot Option 1: Salon Details Modal */}
      {showSalonDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${
              isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BrandLogo size={16} className="grayscale mix-blend-luminosity opacity-80" />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Salon Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSalonDetailsModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] uppercase font-bold tracking-wider">
                  Salon Name
                </span>
                <p className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">{token.salonName}</p>
              </div>

              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] uppercase font-bold tracking-wider">
                  Address & Locality
                </span>
                <p className="text-[#334155] dark:text-slate-300 mt-0.5 font-medium">
                  {salon?.address || '12th Main, Indiranagar'}, {salon?.locality || 'Bengaluru'}
                </p>
              </div>

              <div>
                <span className="text-[#475569] dark:text-[#94A3B8] block text-[11px] uppercase font-bold tracking-wider">
                  Operating Hours & Staff
                </span>
                <p className="text-[#334155] dark:text-slate-300 mt-0.5 font-medium">
                  {salon?.openingHours || '9:00 AM - 9:00 PM'} • {activeBarbers} Active Stylists
                </p>
              </div>

              {salon?.phone && (
                <div className="pt-2">
                  <a
                    href={`tel:${salon.phone}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Salon Desk ({salon.phone})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Three-Dot Option 2: Payment Details Modal */}
      {showPaymentInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${
              isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Payment Mode</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentInfoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700/50">
                <div className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1">
                  Pay at Salon (No Online Prepayment)
                </div>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed text-[11px]">
                  Find My Token guarantees complete pricing transparency with zero advance fees. Settle your bill directly with the barber or salon cashier upon service completion.
                </p>
              </div>

              <div className="flex justify-between items-center py-2 px-1 border-b border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-[#475569] dark:text-[#94A3B8] font-medium">Accepted Modes:</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">UPI (GPay / PhonePe / Paytm), Cash, Cards</span>
              </div>

              <div className="flex justify-between items-center py-1 px-1 text-xs">
                <span className="text-[#475569] dark:text-[#94A3B8] font-medium">Token Total Amount:</span>
                <span className="font-bold font-mono text-base text-blue-600 dark:text-blue-400">₹{token.totalPrice}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-[320px] rounded-3xl border p-5 shadow-lg animate-in fade-in zoom-in-95 duration-200 ${
              isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-100'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Cancel Token #{token.tokenNumber}?
              </h3>
              
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] font-medium mb-6">
                You'll lose your place in the queue.
              </p>
              
              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Keep Token
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                >
                  Cancel Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        REQUIREMENT 1: CLASSIC 2-PART COUPON STUB TICKET (Hero Element Only)
        - Horizontal carnival/cinema coupon stub format
        - Left Stub (58%): "YOUR TOKEN" subtitle + massive high-contrast turn number
        - Right Stub (42%): Symmetrical "Live" badge with animated pulsing green dot
          above clear reminder "PLEASE WAIT FOR YOUR TURN"
        - Perforated vertical dashed separator with circular cutout notches on left,
          right, and divider top/bottom
        - Color is dynamically assigned via sequential rotation (Requirement 2)
        ========================================================================
      */}
      <div 
        className={`w-full max-w-[360px] sm:max-w-[380px] rounded-3xl border relative overflow-hidden transition duration-200 ${currentStyle.bg} ${currentStyle.border}`}
      >
        {/* Left Edge Circular Cutout Notch */}
        <div
          className={`w-4 h-4 rounded-full -left-2 top-1/2 -translate-y-1/2 absolute z-20 pointer-events-none transition-colors border-r ${currentStyle.border} ${
            isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F1F5F9]'
          }`}
        />

        {/* Right Edge Circular Cutout Notch */}
        <div
          className={`w-4 h-4 rounded-full -right-2 top-1/2 -translate-y-1/2 absolute z-20 pointer-events-none transition-colors border-l ${currentStyle.border} ${
            isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F1F5F9]'
          }`}
        />

        {/* Two-Part Stub Layout */}
        <div className="flex items-stretch min-h-[140px] relative z-10">
          {/* Left Stub (Hero Turn Number Section) */}
          <div className={`w-[60%] pl-6 pr-4 py-6 flex flex-col justify-center border-r border-dashed ${currentStyle.dashedBorder}`}>
            <div className={`text-xl font-bold mb-1 ${currentStyle.subtitleColor}`}>
              {token.customerName}&apos;s Token
            </div>
            <div 
              className={`text-6xl sm:text-7xl font-bold tracking-tighter mt-1 leading-none ${currentStyle.numberColor}`}
            >
              {token.tokenNumber}
            </div>
          </div>

          {/* Right Stub (Live Badge + Turn Reminder) */}
          <div className="w-[40%] pl-4 pr-6 py-6 flex flex-col items-center justify-center text-center">
            {/* Symmetrically placed "Live" badge with animated pulsing green dot */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border ${currentStyle.badgeBg} ${currentStyle.badgeText} ${currentStyle.badgeBorder}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>ACTIVE</span>
            </div>

            {/* Clear Reminder Text */}
            <div className="flex flex-col items-center mt-3">
               <Clock className={`w-4 h-4 mb-1.5 ${currentStyle.reminderColor}`} />
               <p className={`text-[9px] sm:text-[10px] font-medium uppercase tracking-wider leading-relaxed ${currentStyle.reminderColor}`}>
                 PLEASE WAIT<br/>FOR YOUR TURN
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        LOWER DETAILS CONTAINER (Clean & Normal Below the Stub)
        - Salon Header with Location
        - 3-Column Live Queue Metrics (Now Serving, People Ahead, Est. Wait)
        - Booked Services List & Total
        - Reassurance Notice ("You relax, we'll notify you before your turn.")
        - Pre-alert Reminder Setting
        - Transparent Payment Notice (Pay at Salon)
        ========================================================================
      */}
      <div 
        className={`w-full max-w-[360px] sm:max-w-[380px] mt-4 rounded-3xl border p-4 space-y-3.5 transition ${
          isDarkMode
            ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
        }`}
      >
        {/* Salon Header & Status */}
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <h2 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-tight line-clamp-1">
              {token.salonName}
            </h2>
            <p className="text-xs text-[#334155] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">{salon?.locality || 'Bengaluru, India'}</span>
            </p>
          </div>

          <div className="shrink-0">
            {isServing ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                At Chair
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                <XCircle className="w-3 h-3" /> Cancelled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Users className="w-3 h-3" /> {activeBarbers} Stylists
              </span>
            )}
          </div>
        </div>

        {/* 3-Column Live Queue Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* 1. Now Serving */}
          <div
            className={`rounded-2xl p-2.5 border transition ${
              isDarkMode ? 'bg-[#0B1120]/70 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
            }`}
          >
            <div className="text-[9px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] tracking-wider">
              Now Serving
            </div>
            <div className="text-sm font-black font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-1 truncate">
              {servingTokenNumbers || 'Starting'}
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">At Chair</div>
          </div>

          {/* 2. People Ahead */}
          <div
            className={`rounded-2xl p-2.5 border transition ${
              isDarkMode ? 'bg-[#0B1120]/70 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
            }`}
          >
            <div className="text-[9px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] tracking-wider">
              People Ahead
            </div>
            <div className="text-base font-black text-blue-700 dark:text-blue-400 mt-0.5">
              {isServing ? '0' : peopleAhead}
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">
              {peopleAhead === 0 && !isServing ? 'You are Next' : 'waiting'}
            </div>
          </div>

          {/* 3. Est. Wait */}
          <div
            className={`rounded-2xl p-2.5 border transition ${
              isDarkMode ? 'bg-[#0B1120]/70 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
            }`}
          >
            <div className="text-[9px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] tracking-wider">
              Est. Wait
            </div>
            <div className="text-base font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
              {isServing ? '0m' : `~${estimatedWaitMins}m`}
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">
              {activeBarbers} chairs
            </div>
          </div>
        </div>

        {/* Booked Services Breakdown */}
        <div
          className={`rounded-2xl p-3 border text-xs ${
            isDarkMode ? 'bg-[#0B1120]/70 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
          }`}
        >
          <div className="flex justify-between items-center text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
            <span>Booked Services ({token.services.length})</span>
            <span className="font-mono text-sm text-blue-700 dark:text-blue-400 font-black">₹{token.totalPrice}</span>
          </div>
          <div className="space-y-1 text-xs text-[#1E293B] dark:text-slate-300">
            {token.services.map((s) => (
              <div key={s.id} className="flex justify-between items-center">
                <span className="truncate pr-2 font-semibold">• {s.name}</span>
                <span className="font-mono shrink-0 font-extrabold text-[#0F172A] dark:text-slate-200">₹{s.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reassurance Notice */}
        <div
          className={`rounded-2xl p-2.5 text-center border text-xs font-bold flex items-center justify-center gap-1.5 ${
            isDarkMode
              ? 'bg-blue-950/40 border-blue-800/40 text-blue-200'
              : 'bg-blue-50/95 border-blue-200 text-blue-950'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>&ldquo;You relax, we&rsquo;ll notify you before your turn.&rdquo;</span>
        </div>

        {/* Pre-alert Reminder Setting */}
        {isWaiting && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs px-0.5">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Pre-alert Reminder
              </span>
              <button
                type="button"
                onClick={() => setShowReminderPicker(!showReminderPicker)}
                className="font-extrabold text-xs text-blue-700 dark:text-blue-400 hover:underline"
              >
                {reminderMinutes} mins before (Edit)
              </button>
            </div>

            {showReminderPicker && (
              <div className="p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700/60 bg-[#F1F5F9] dark:bg-[#0B1120]/70 space-y-2">
                {/* 4-Option Grid: 5m, 10m, 15m, Custom */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false);
                        handleReminderChange(mins);
                      }}
                      className={`py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                        reminderMinutes === mins && !showCustomInput
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[#0F172A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1 ${
                      showCustomInput || !isPresetMinutes
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[#0F172A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    <span>Custom</span>
                  </button>
                </div>

                {/* Custom Minutes Input Panel */}
                {showCustomInput && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#334155] dark:text-[#94A3B8]">
                        Choose custom alert time:
                      </span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {customMinutesVal} mins before
                      </span>
                    </div>

                    {/* Numeric Stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomMinutesVal((prev) => Math.max(1, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center active:scale-95 text-[#0F172A] dark:text-[#F8FAFC]"
                        aria-label="Decrease minutes"
                      >
                        -
                      </button>

                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={customMinutesVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              setCustomMinutesVal(Math.max(1, Math.min(60, val)));
                            }
                          }}
                          className="w-full h-8 rounded-lg text-center font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] font-medium text-slate-400 pointer-events-none">
                          min
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCustomMinutesVal((prev) => Math.min(60, prev + 1))}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center active:scale-95 text-[#0F172A] dark:text-[#F8FAFC]"
                        aria-label="Increase minutes"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {[7, 12, 20, 25, 30].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setCustomMinutesVal(mins)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                            customMinutesVal === mins
                              ? 'bg-blue-100 dark:bg-blue-950/70 border-blue-400 text-blue-700 dark:text-blue-300'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReminderChange(customMinutesVal)}
                      className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-98 shadow-xs"
                    >
                      Set Custom Alert ({customMinutesVal}m)
                    </button>
                  </div>
                )}

                {/* Background & Lockscreen notification permission check */}
                {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="w-full mt-1 p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
                  >
                    <BellRing className="w-3 h-3 animate-pulse text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Enable background & lockscreen alerts</span>
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Recalculation Status Indicator */}
            <div className="text-[10px] px-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Est. wait ~{estimatedWaitMins}m
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {estimatedWaitMins <= reminderMinutes ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Turn alert window active
                  </span>
                ) : (
                  `Alert in ~${Math.max(1, estimatedWaitMins - reminderMinutes)}m`
                )}
              </span>
            </div>

            {reminderSavedAlert && (
              <div className="text-xs text-blue-700 dark:text-blue-400 text-center font-bold flex items-center justify-center gap-1 animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5" /> Alert set for {reminderMinutes} mins before turn
              </div>
            )}
          </div>
        )}

        {/* Payment Integrity Notice */}
        <div className="flex items-center justify-between text-xs text-[#334155] dark:text-[#94A3B8] pt-2 border-t border-slate-200 dark:border-slate-700/60">
          <span className="font-bold">Payment Method:</span>
          <span className="font-black uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
            Pay at Salon (Cash / UPI)
          </span>
        </div>
      </div>

      {/* 
        ========================================================================
        REQUIREMENT 3: BOTTOM ROW WITH "GO TO HOME SCREEN" & THREE-DOT (⋮) MENU
        - Placed symmetrically side-by-side at the bottom row
        - Three-dot menu contains: Salon Details, Payment Info, Cancel Token
        - Symmetrical, modern, and accessible
        ========================================================================
      */}
      <div className="mt-4 w-full max-w-[360px] sm:max-w-[380px] flex items-center gap-2.5">
        {/* Go to home screen button */}
        <button
          type="button"
          onClick={() => {
            if (onExploreSalons) {
              onExploreSalons();
            } else {
              setActiveTab('home');
            }
          }}
          className={`flex-1 py-3 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 hover:bg-slate-800/80 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-300 hover:bg-slate-50 text-[#0F172A] shadow-[0_2px_8px_rgba(15,23,42,0.05)]'
          }`}
        >
          <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Go to home screen</span>
        </button>

        {/* Relocated Three-Dot (⋮) Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            aria-label="More token actions"
            className={`h-[46px] w-[50px] rounded-2xl border flex items-center justify-center transition active:scale-95 ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 hover:bg-slate-800/80 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-[#0F172A] shadow-[0_2px_8px_rgba(15,23,42,0.05)]'
            }`}
          >
            <MoreVertical className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />
          </button>

          {/* Options Dropdown Menu (Opens upwards cleanly) */}
          {showOptionsMenu && (
            <div
              className={`absolute right-0 bottom-full mb-2 w-48 rounded-2xl border shadow-2xl z-30 p-1.5 animate-in fade-in zoom-in-95 ${
                isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowSalonDetailsModal(true);
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Salon Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowPaymentInfoModal(true);
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                <span>Payment Info</span>
              </button>

              {(isWaiting || isServing) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOptionsMenu(false);
                    setShowCancelModal(true);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center gap-2 transition border-t border-slate-200 dark:border-slate-800 mt-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Token</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
