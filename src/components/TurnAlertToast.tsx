import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { Bell, Scissors, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { 
  InAppAlert, 
  subscribeToInAppAlerts, 
  dismissInAppAlert 
} from '../utils/notificationService';
import { useAppStore } from '../store';

export const TurnAlertToast: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<InAppAlert | null>(null);
  const { setActiveTab, isDarkMode, currentRole, activeCustomerToken } = useAppStore();

  useEffect(() => {
    const unsubscribe = subscribeToInAppAlerts((alert) => {
      setActiveAlert(alert);
    });
    return unsubscribe;
  }, []);

  // CRITICAL: Never show customer pre-alert notification inside Business/Barber dashboard
  if (currentRole !== 'customer') return null;
  if (!activeAlert) return null;
  // Ensure the alert belongs to current customer's active token
  if (activeCustomerToken && activeAlert.tokenId !== activeCustomerToken.id) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activeAlert.id}
        initial={{ opacity: 0, y: -24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="fixed top-4 left-4 right-4 max-w-md mx-auto z-[9999] pointer-events-auto shadow-2xl"
      >
        <div
          className={`rounded-2xl border p-4 backdrop-blur-md ${
            activeAlert.isTurnNow
              ? isDarkMode
                ? 'bg-[#1E1B4B] border-amber-500/60 text-white shadow-[0_10px_30px_rgba(245,158,11,0.25)]'
                : 'bg-amber-50/95 border-amber-400 text-amber-950 shadow-[0_10px_30px_rgba(245,158,11,0.2)]'
              : isDarkMode
              ? 'bg-[#0F172A]/95 border-blue-500/50 text-[#F8FAFC] shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              : 'bg-white/95 border-blue-200 text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.15)]'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Animated Icon Avatar */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activeAlert.isTurnNow
                  ? 'bg-amber-500 text-white animate-bounce'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {activeAlert.isTurnNow ? (
                <BrandLogo size={20} />
              ) : (
                <Bell className="w-5 h-5 animate-pulse" />
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Token #{activeAlert.tokenNumber}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {activeAlert.isTurnNow ? 'Ready Now' : `~${activeAlert.estimatedWaitMins}m left`}
                </span>
              </div>

              <h4 className="text-sm font-black mt-1 leading-tight">
                {activeAlert.isTurnNow
                  ? "It's Your Turn! Barber is Ready"
                  : 'Turn Approaching Soon'}
              </h4>

              <p className="text-xs mt-1 text-[#334155] dark:text-[#94A3B8] font-medium leading-relaxed">
                {activeAlert.message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('token');
                    dismissInAppAlert();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  <span>View Token</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={dismissInAppAlert}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={dismissInAppAlert}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
              aria-label="Close alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
