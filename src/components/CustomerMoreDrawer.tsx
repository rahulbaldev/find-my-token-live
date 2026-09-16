import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store';
import { 
  playNotificationChime, 
  requestNotificationPermission, 
  getNotificationPermission 
} from '../utils/notificationService';
import { 
  User, 
  Moon, 
  Sun, 
  Info, 
  HelpCircle, 
  Shield, 
  MessageSquare, 
  RotateCcw, 
  LogOut, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Star, 
  Clock, 
  X,
  Bell,
  BellRing
} from 'lucide-react';

interface CustomerMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerMoreDrawer: React.FC<CustomerMoreDrawerProps> = ({ isOpen, onClose }) => {
  const shouldReduceMotion = useReducedMotion();
  const { 
    isDarkMode, 
    toggleTheme, 
    currentUser, 
    logout, 
    resetAllDemoData,
    reminderMinutes,
    setReminderMinutes
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<'menu' | 'about' | 'help' | 'privacy' | 'feedback'>('menu');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCustomDrawerReminder, setShowCustomDrawerReminder] = useState(![5, 10, 15].includes(reminderMinutes));
  const [customDrawerMinutes, setCustomDrawerMinutes] = useState<number>(
    ![5, 10, 15].includes(reminderMinutes) ? reminderMinutes : 20
  );
  const [reminderSavedToast, setReminderSavedToast] = useState(false);

  useEffect(() => {
    if (![5, 10, 15].includes(reminderMinutes)) {
      setCustomDrawerMinutes(reminderMinutes);
    }
  }, [reminderMinutes]);

  const handleSetReminder = async (mins: number) => {
    const valid = Math.max(1, Math.min(60, Math.round(mins)));
    setReminderMinutes(valid);
    playNotificationChime();
    setReminderSavedToast(true);
    if (getNotificationPermission() === 'default') {
      await requestNotificationPermission();
    }
    setTimeout(() => setReminderSavedToast(false), 2500);
  };

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the digital queue turn system work?',
      a: 'Find My Token assigns a live turn number (e.g., #B-12). The dynamic wait time is calculated from active salon chairs and service durations. You can relax outside and arrive right when your chair is ready.'
    },
    {
      q: 'Why is only one active token allowed?',
      a: 'To guarantee fairness and prevent appointment hoarding, our Rule of Singularity enforces exactly one active turn per person at a time.'
    },
    {
      q: 'Do I pay online when taking a token?',
      a: 'No. There are zero online booking fees. You always pay directly at the salon counter via Cash or UPI after receiving your service.'
    },
    {
      q: 'What happens if I miss my turn?',
      a: 'Salons offer a short grace window. If you are delayed, the queue advances to avoid holding up other customers, and you can request a quick re-entry at the desk.'
    }
  ];

  // Handle hardware/browser Back button and Esc key closing
  const pushedHistoryRef = React.useRef(false);
  const activeSectionRef = React.useRef(activeSection);
  const showLogoutConfirmRef = React.useRef(showLogoutConfirm);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    showLogoutConfirmRef.current = showLogoutConfirm;
  }, [showLogoutConfirm]);

  useEffect(() => {
    if (!isOpen) {
      setActiveSection('menu');
      setShowLogoutConfirm(false);
      return;
    }

    // Push history entry for mobile/browser Back gesture
    try {
      window.history.pushState({ modal: 'customer-more-sheet' }, '');
      pushedHistoryRef.current = true;
    } catch {
      // Ignore if iframe history restrictions apply
    }

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      if (showLogoutConfirmRef.current) {
        setShowLogoutConfirm(false);
        // Push state again so next back closes the drawer or section
        try {
          window.history.pushState({ modal: 'customer-more-sheet' }, '');
          pushedHistoryRef.current = true;
        } catch {}
        return;
      }

      if (activeSectionRef.current !== 'menu') {
        setActiveSection('menu');
        // Push state again so next back closes the drawer
        try {
          window.history.pushState({ modal: 'customer-more-sheet' }, '');
          pushedHistoryRef.current = true;
        } catch {}
      } else {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirmRef.current) {
          setShowLogoutConfirm(false);
          return;
        }
        if (activeSectionRef.current !== 'menu') {
          setActiveSection('menu');
        } else {
          setActiveSection('menu');
          onClose();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      if (pushedHistoryRef.current && window.history.state?.modal === 'customer-more-sheet') {
        pushedHistoryRef.current = false;
        try {
          window.history.back();
        } catch {
          // Ignore
        }
      }
    };
  }, [isOpen, onClose]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      setActiveSection('menu');
    }, 2000);
  };

  const handleResetData = () => {
    resetAllDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  };

  const handleClose = () => {
    setActiveSection('menu');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
          {/* Subtle Background Dim WITHOUT Blur - Clean, lightweight, keeps Home visible */}
          <motion.div
            key="customer-more-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/40 dark:bg-black/55 cursor-pointer pointer-events-auto"
            aria-label="Close drawer"
          />

          {/* Premium Bottom Sheet: ~78% screen height, smooth 280ms slide-up without bounce/overshoot */}
          <motion.div
            key="customer-more-drawer"
            initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            drag={shouldReduceMotion ? false : 'y'}
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            dragSnapToOrigin
            onDragEnd={(_e, info) => {
              if (info.offset.y > 60 || info.velocity.y > 200) {
                handleClose();
              }
            }}
            className={`relative z-10 w-full max-w-lg mx-auto h-[78vh] sm:h-[78dvh] max-h-[78vh] sm:max-h-[78dvh] flex flex-col rounded-t-[28px] sm:rounded-t-[32px] border-t shadow-[0_-8px_30px_rgba(0,0,0,0.28)] overflow-hidden pointer-events-auto transform-gpu will-change-transform ${
              isDarkMode
                ? 'bg-[#0F172A] border-slate-700/80 text-[#F8FAFC]'
                : 'bg-white border-slate-200 text-[#0F172A]'
            }`}
          >
            {/* Tactile Drag Handle Pill */}
            <div className="w-full pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition" />
            </div>

            {/* Top Bar Header with Smooth Back / Close controls */}
            <div className="px-4 pb-3 pt-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              {activeSection !== 'menu' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('menu')}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition active:scale-95 cursor-pointer"
                    aria-label="Back to Menu"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-sm font-bold capitalize">
                    {activeSection === 'about' && 'About Find My Token'}
                    {activeSection === 'help' && 'Help & FAQs'}
                    {activeSection === 'privacy' && 'Privacy Policy'}
                    {activeSection === 'feedback' && 'Share Feedback'}
                  </h2>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition active:scale-95 cursor-pointer"
                    aria-label="Back / Close"
                    title="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      More Options
                    </h2>
                    <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-medium">
                      Find My Token • Quick Settings
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body with smooth scrolling */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-20 space-y-3.5">
              {activeSection === 'menu' && (
                <>
                  {/* User Profile Card - Name Only, No Customer label */}
                  {currentUser && (
                    <div
                      className={`rounded-2xl border p-3.5 flex items-center justify-between ${
                        isDarkMode
                          ? 'bg-[#131D31] border-slate-700/60'
                          : 'bg-slate-50 border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {currentUser.name}
                          </div>
                          <div className="text-xs text-[#475569] dark:text-[#94A3B8] font-mono">
                            {currentUser.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Turn Reminder Pre-alert Setting Card */}
                  <div
                    className={`rounded-2xl border p-3 space-y-2.5 ${
                      isDarkMode
                        ? 'bg-[#131D31] border-slate-700/60'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            Turn Pre-alert Reminder
                          </div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                            Alerts {reminderMinutes} mins before your turn
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={playNotificationChime}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40"
                      >
                        Test Chime
                      </button>
                    </div>

                    {/* 4-Option Selector: 5m, 10m, 15m, Custom */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 10, 15].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setShowCustomDrawerReminder(false);
                            handleSetReminder(mins);
                          }}
                          className={`py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                            reminderMinutes === mins && !showCustomDrawerReminder
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setShowCustomDrawerReminder(true)}
                        className={`py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                          showCustomDrawerReminder || ![5, 10, 15].includes(reminderMinutes)
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC]'
                        }`}
                      >
                        Custom
                      </button>
                    </div>

                    {/* Custom Input Panel inside Drawer */}
                    {showCustomDrawerReminder && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-[#334155] dark:text-[#94A3B8]">Custom reminder time:</span>
                          <span className="text-blue-600 dark:text-blue-400">{customDrawerMinutes} mins</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCustomDrawerMinutes((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm flex items-center justify-center active:scale-95 text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            -
                          </button>

                          <div className="flex-1 relative">
                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={customDrawerMinutes}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (!isNaN(v)) {
                                  setCustomDrawerMinutes(Math.max(1, Math.min(60, v)));
                                }
                              }}
                              className="w-full h-8 rounded-lg text-center font-bold text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC]"
                            />
                            <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-medium pointer-events-none">
                              min
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setCustomDrawerMinutes((prev) => Math.min(60, prev + 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm flex items-center justify-center active:scale-95 text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSetReminder(customDrawerMinutes)}
                          className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-98 shadow-xs"
                        >
                          Set Custom Alert ({customDrawerMinutes}m)
                        </button>
                      </div>
                    )}

                    {reminderSavedToast && (
                      <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Turn alert set for {reminderMinutes} mins before turn
                      </div>
                    )}
                  </div>

                  {/* Appearance Toggle Card */}
                  <div
                    className={`rounded-2xl border p-3 flex items-center justify-between ${
                      isDarkMode
                        ? 'bg-[#131D31] border-slate-700/60'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          Appearance
                        </div>
                        <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                          {isDarkMode ? 'Dark theme active' : 'Light theme active'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                          : 'bg-white border-slate-300 text-[#0F172A] hover:bg-slate-100'
                      }`}
                    >
                      {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                  </div>

                  {/* Navigation Links Menu */}
                  <div
                    className={`rounded-2xl border overflow-hidden divide-y ${
                      isDarkMode
                        ? 'bg-[#131D31] border-slate-700/60 divide-slate-700/60'
                        : 'bg-white border-slate-200/90 divide-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSection('about')}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">About Find My Token</div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Queue turn system for Indian salons</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('help')}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Help &amp; Support</div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">FAQs &amp; queue turn rules</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('privacy')}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Privacy Policy</div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Zero spam &amp; turn alerts only</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection('feedback')}
                      className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Share Feedback</div>
                          <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">Rate your experience</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Reset Demo Data */}
                  <div
                    className={`rounded-2xl border p-3 flex items-center justify-between ${
                      isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        Reset Demo State
                      </div>
                      <div className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                        Restore queues and demo data
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetData}
                      className="px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition flex items-center gap-1 active:scale-95 shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resetDone ? 'Done!' : 'Reset'}</span>
                    </button>
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogoutConfirm(true);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 ${
                        isDarkMode
                          ? 'bg-red-950/25 border-red-900/50 hover:bg-red-950/40 text-red-300'
                          : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}

              {/* SUBVIEW: ABOUT */}
              {activeSection === 'about' && (
                <div className="space-y-3">
                  <div
                    className={`rounded-2xl border p-4 space-y-2.5 ${
                      isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <h3 className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Digital Turns for Indian Salons
                    </h3>
                    <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed font-medium">
                      In India, customers often spend 45–90 minutes waiting on crowded barber sofas without knowing when their turn is.
                    </p>
                    <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed font-medium">
                      <strong>Find My Token</strong> gives transparency: check live chairs, take your digital turn token, and arrive exactly when your barber chair is ready.
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-xl p-2.5 text-xs space-y-1">
                      <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Dynamic Wait Calculation
                      </div>
                      <p className="text-[11px] font-mono text-[#0F172A] dark:text-slate-300">
                        Wait Time = (Sum of services ahead) ÷ (Active chairs)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBVIEW: HELP & FAQS */}
              {activeSection === 'help' && (
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border overflow-hidden ${
                        isDarkMode ? 'border-slate-700/60 bg-[#131D31]' : 'border-slate-200/90 bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full p-3 text-left text-xs font-bold text-[#0F172A] dark:text-slate-200 flex items-center justify-between"
                      >
                        <span>{faq.q}</span>
                        <span className="text-slate-500 font-bold ml-2">{openFaq === i ? '−' : '+'}</span>
                      </button>
                      {openFaq === i && (
                        <div className="px-3 pb-3 text-xs text-[#334155] dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 pt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SUBVIEW: PRIVACY */}
              {activeSection === 'privacy' && (
                <div
                  className={`rounded-2xl border p-4 space-y-3 text-xs leading-relaxed ${
                    isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200/90 text-[#334155]'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-[#0F172A] dark:text-white mb-0.5">1. Zero Spam Calls</h4>
                    <p>Your mobile number is strictly used for turn tracking notifications at the salon desk.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] dark:text-white mb-0.5">2. Rule of Singularity</h4>
                    <p>Exactly 1 active turn per customer ensures no hoarding across neighborhood shops.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] dark:text-white mb-0.5">3. Payment Transparency</h4>
                    <p>Always pay at the salon after service. We do not store or process payment card details.</p>
                  </div>
                </div>
              )}

              {/* SUBVIEW: FEEDBACK */}
              {activeSection === 'feedback' && (
                <div
                  className={`rounded-2xl border p-4 ${
                    isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
                  }`}
                >
                  {feedbackSubmitted ? (
                    <div className="py-4 text-center space-y-1.5">
                      <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                      <div className="font-bold text-xs text-[#0F172A] dark:text-white">Thank You!</div>
                      <p className="text-[11px] text-[#475569] dark:text-slate-400">
                        Your feedback has been received.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1.5">
                          Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className={`p-1.5 rounded-lg border transition ${
                                star <= rating
                                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                                  : 'border-slate-300 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-[#475569] dark:text-[#94A3B8] mb-1">
                          Comment
                        </label>
                        <textarea
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Your suggestions or experience..."
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-[#0B1120] border-slate-700 text-white'
                              : 'bg-white border-slate-300 text-[#0F172A]'
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 pointer-events-auto">
          <div className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-200/90'}`}>
            <h3 className={`text-lg font-black text-center mb-6 ${isDarkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
              Are you sure you want to logout?
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition active:scale-95 ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleClose();
                  logout();
                }}
                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95 ${
                  isDarkMode
                    ? 'bg-red-950/40 border-red-900/50 hover:bg-red-950/60 text-red-300'
                    : 'bg-red-600 border-red-700 hover:bg-red-700 text-white'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
