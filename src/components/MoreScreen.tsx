import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store';
import { BrandLogo } from './BrandLogo';
import { RegisterSalonForm } from './RegisterSalonForm';
import { ServiceManager } from './ServiceManager';
import { 
  Info, 
  HelpCircle, 
  Shield, 
  MessageSquare, 
  RotateCcw, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Scissors, 
  Clock, 
  Moon, 
  Sun, 
  LogOut, 
  User, 
  Store, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Power,
  X 
} from 'lucide-react';
import { checkSalonOpenStatus } from '../utils/salonSchedule';

interface MoreScreenProps {
  onClose?: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onClose }) => {
  const shouldReduceMotion = useReducedMotion();
  const { 
    isDarkMode, 
    toggleTheme, 
    currentUser, 
    currentRole, 
    salons,
    businessSalonId,
    toggleBarberActiveStatus,
    updateSalonServices,
    logout, 
    resetAllDemoData 
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<
    'menu' | 'about' | 'help' | 'privacy' | 'feedback' | 'register_salon' | 'barbers_management' | 'services_management'
  >('menu');

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle Escape key and Back button for logout modal
  const pushedLogoutHistoryRef = React.useRef(false);
  const showLogoutConfirmRef = React.useRef(showLogoutConfirm);

  useEffect(() => {
    showLogoutConfirmRef.current = showLogoutConfirm;
    
    if (showLogoutConfirm && !pushedLogoutHistoryRef.current) {
      try {
        window.history.pushState({ modal: 'business-logout-confirm' }, '');
        pushedLogoutHistoryRef.current = true;
      } catch {}
    } else if (!showLogoutConfirm && pushedLogoutHistoryRef.current) {
      if (window.history.state?.modal === 'business-logout-confirm') {
        try {
          window.history.back();
        } catch {}
      }
      pushedLogoutHistoryRef.current = false;
    }
  }, [showLogoutConfirm]);

  useEffect(() => {
    const handlePopState = () => {
      if (showLogoutConfirmRef.current) {
        setShowLogoutConfirm(false);
        pushedLogoutHistoryRef.current = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutConfirmRef.current) {
        setShowLogoutConfirm(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentBusinessSalon = salons.find((s) => s.id === businessSalonId) || salons[0];
  const activeBarbersCount = currentBusinessSalon.barbers.filter((b) => b.isActive !== false).length;

  const faqs = [
    {
      q: 'How does the digital queue turn system work?',
      a: 'Find My Token generates a real-time turn number (e.g., #B-12) calculated using active barber chairs and individual service durations. You can relax outside the salon and return right before your turn.'
    },
    {
      q: 'Why is there strictly only one active token allowed?',
      a: 'To maintain fairness and eliminate ghost queues or appointment hoarding across local barbers, our Rule of Singularity enforces exactly one active turn per person at a time.'
    },
    {
      q: 'Do I pay online when taking a token?',
      a: 'No. There is zero online payment collection or booking fee. You pay directly at the salon counter via Cash or UPI after receiving your service.'
    },
    {
      q: 'What happens if I miss my turn?',
      a: 'Salons provide a brief grace window. If not present, the chair advances to keep queues moving smoothly, and you can speak with the front desk to re-enter.'
    }
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      setActiveSection('menu');
    }, 2500);
  };

  const handleResetData = () => {
    resetAllDemoData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-24">
      {/* Requirement 1: Only display the main menu title when in menu view.
          Subviews display their own single back button and header to completely eliminate duplicate back arrows. */}
      {activeSection === 'menu' && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
              More Options
            </h1>
            <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
              Find My Token • Your Turn. Without the Wait.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              aria-label="Close More sheet"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* MAIN MENU VIEW */}
      {activeSection === 'menu' && (
        <div className="space-y-4">
          {/* User Profile Card */}
          {currentUser && (
            <div
              className={`rounded-2xl border p-4 transition flex items-center justify-between ${
                isDarkMode
                  ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                  : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  {currentUser.role === 'customer' ? <User className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold font-mono">
                    {currentUser.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme Switcher Card Exclusively Here */}
          <div
            className={`rounded-2xl border p-4 transition flex items-center justify-between ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                  Appearance
                </div>
                <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-semibold">
                  {isDarkMode ? 'Currently in Dark Mode' : 'Currently in Light Mode'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-2xs ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-300 text-[#0F172A] hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>

          {/* BUSINESS OWNER EXCLUSIVE SECTIONS */}
          {currentRole === 'business' ? (
            <div className="space-y-3">
              <div className="px-1 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>Business Administration ({currentBusinessSalon.name})</span>
              </div>

              {/* Requirement 3 & 4: Dedicated Active Barbers / Off Duty management (EXCLUSIVELY HERE) */}
              <button
                type="button"
                onClick={() => setActiveSection('barbers_management')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group active:scale-[0.99] ${
                  isDarkMode
                    ? 'bg-[#131D31] border-slate-700/60 hover:border-blue-500 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                        Active Barbers
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {activeBarbersCount} / {currentBusinessSalon.barbers.length} Active
                      </span>
                    </div>
                    <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                      Toggle barber duty status. Wait times dynamically adjust.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              {/* Requirement 5: Dedicated Service + Estimated Time Setup */}
              <button
                type="button"
                onClick={() => setActiveSection('services_management')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group active:scale-[0.99] ${
                  isDarkMode
                    ? 'bg-[#131D31] border-slate-700/60 hover:border-blue-500 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <BrandLogo size={20} className="grayscale" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                        Services & Estimated Times
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {currentBusinessSalon.services.length} Services
                      </span>
                    </div>
                    <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                      Configure service names, pricing (₹), and wait-time duration (mins).
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>

              {/* Salon Profile, Uploaded Photos & Hours */}
              <button
                type="button"
                onClick={() => setActiveSection('register_salon')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group active:scale-[0.99] ${
                  isDarkMode
                    ? 'bg-[#131D31] border-slate-700/60 hover:border-blue-500 shadow-md'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Edit Salon Profile & Schedule
                    </span>
                    <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                      Upload gallery photos, change address, capacity and hours.
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
              </button>
            </div>
          ) : null}

          {/* Navigational Links Menu */}
          <div
            className={`rounded-2xl border overflow-hidden divide-y transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 divide-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 divide-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveSection('about')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">About Find My Token</div>
                  <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium">Queue transparency for Indian salons</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('help')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Help & Support</div>
                  <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium">FAQs and customer desk guidance</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('privacy')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Privacy Policy</div>
                  <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium">Zero data selling & turn notifications only</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('feedback')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Share Feedback</div>
                  <div className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium">Rate your experience & suggest features</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Reset Applet Demo Data Card */}
          <div
            className={`rounded-2xl border p-4 transition ${
              isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-200/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Reset Demo State
                </div>
                <div className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                  Restore queues, demo salons and test data
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] transition flex items-center gap-1 active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
            {resetDone && (
              <div className="text-xs text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Prototype data reset to default!
              </div>
            )}
          </div>

          {/* Dedicated Logout Button Exclusively Inside More Options */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 ${
                isDarkMode
                  ? 'bg-red-950/30 border-red-900/50 hover:bg-red-950/50 text-red-300'
                  : 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBVIEW: REGISTER OR EDIT SALON VIEW (Has single clean back arrow) */}
      {activeSection === 'register_salon' && (
        <RegisterSalonForm
          existingSalon={currentRole === 'business' ? currentBusinessSalon : undefined}
          onClose={() => setActiveSection('menu')}
          onSuccess={() => setActiveSection('menu')}
        />
      )}

      {/* SUBVIEW: MANAGE ACTIVE BARBERS (Requirement 3 & 4: ONLY INSIDE MORE) */}
      {activeSection === 'barbers_management' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Active Barbers
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                {currentBusinessSalon.name} • Duty & Chair Management
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-4 transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block uppercase tracking-wide">
                  Chair Duty Controller
                </span>
                <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
                  Toggle barbers On Duty or Off Duty. When off duty, chair is excluded from dynamic queue calculation.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shrink-0">
                {activeBarbersCount} / {currentBusinessSalon.barbers.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {currentBusinessSalon.barbers.map((barber) => {
                const isOnDuty = barber.isActive !== false;
                return (
                  <div
                    key={barber.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      isOnDuty
                        ? isDarkMode
                          ? 'bg-[#0B1120]/70 border-slate-700/60'
                          : 'bg-slate-50 border-slate-200/90'
                        : isDarkMode
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-100/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={barber.photo}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                          {barber.barberNumber || `Seat ${barber.seatNumber}`}
                        </div>
                        <div className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                          {barber.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {isOnDuty ? 'Available for queue calculation' : 'Off-duty (Excluded from queue)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBarberActiveStatus(currentBusinessSalon.id, barber.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                        isOnDuty
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: SERVICES & ESTIMATED TIME SETUP (Requirement 5) */}
      {activeSection === 'services_management' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Services & Estimated Times
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                {currentBusinessSalon.name} • Dynamic Wait Time Setup
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-4 transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block uppercase tracking-wide">
                Salon Service Catalog
              </span>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
                Changes to service pricing (₹) and estimated time (min) take effect immediately for customer bookings and live turn wait calculations.
              </p>
            </div>

            <ServiceManager
              services={currentBusinessSalon.services}
              onChange={(updatedServices) => updateSalonServices(currentBusinessSalon.id, updatedServices)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* SUBVIEW: ABOUT SCREEN */}
      {activeSection === 'about' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                About Find My Token
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                Queue transparency for Indian salons
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-4 transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <BrandLogo size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">Find My Token</h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-extrabold italic">
                  &ldquo;Your Turn. Without the Wait.&rdquo;
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#1E293B] dark:text-slate-300 font-medium">
              In bustling Indian neighborhoods, visiting your favorite salon or local barber shop often meant enduring 45 to 90 minutes of unproductive, crowded waiting in plastic chairs.
            </p>

            <p className="text-xs leading-relaxed text-[#1E293B] dark:text-slate-300 font-medium">
              <strong>Find My Token</strong> redefines this completely. Customers view live queue positions, select services with upfront pricing, and take an authentic retro turn coupon. Arrive exactly when your barber chair is ready.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-3.5 space-y-2 text-xs">
              <h4 className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Dynamic Queue Turn Calculation
              </h4>
              <p className="text-[#0F172A] dark:text-slate-300 text-[11px] leading-normal font-mono font-bold">
                Wait Time = (Sum of service durations of people ahead) ÷ (Active salon chairs)
              </p>
            </div>

            <div className="space-y-1 text-xs text-[#334155] dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 font-medium">
              <div>Version: 1.0.0 (Production Release)</div>
              <div>Crafted specifically for Indian Salons & Barber Shops</div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: HELP SCREEN */}
      {activeSection === 'help' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Help & Support
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                FAQs and customer desk guidance
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-3 transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden ${
                    isDarkMode ? 'border-slate-700/60 bg-[#0B1120]/60' : 'border-slate-200/90 bg-[#F8FAFC]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-3.5 text-left text-xs font-bold text-[#0F172A] dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-500 font-black text-sm ml-2">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="p-3.5 pt-0 text-xs text-[#334155] dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: PRIVACY POLICY */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Privacy Policy
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                Zero data selling & turn notifications only
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-3 transition text-xs leading-relaxed text-[#1E293B] dark:text-slate-300 font-medium ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div>
              <h4 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5">1. Zero Spam & Promotional Calls</h4>
              <p>Your mobile number is strictly utilized to deliver turn status notifications and identify your digital token at the salon counter.</p>
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5">2. Rule of Singularity</h4>
              <p>Customers can hold only 1 active token at any given moment. This guarantees fair access and prevents unfair queue congestion across local businesses.</p>
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-0.5">3. Payment Transparency</h4>
              <p>All payments happen directly between you and the salon after service delivery. Find My Token does not store or process your financial credentials.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: FEEDBACK SCREEN */}
      {activeSection === 'feedback' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('menu')}
              aria-label="Back to menu"
              className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Share Feedback
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-bold">
                Rate your waiting experience and let us know what features you&apos;d love
              </p>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 space-y-4 transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            {feedbackSubmitted ? (
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto" />
                <div className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">Thank You!</div>
                <p className="text-xs text-[#334155] dark:text-slate-300 font-medium">
                  Your feedback helps us support barber shops across India.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] dark:text-[#94A3B8] mb-2">
                    Experience Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 rounded-xl border transition ${
                          star <= rating
                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                            : isDarkMode
                            ? 'border-slate-700 bg-[#0B1120] text-slate-600'
                            : 'border-slate-300 bg-[#F8FAFC] text-slate-400'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#0F172A] dark:text-[#94A3B8] mb-1.5">
                    Comments & Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="e.g. Accurate wait times, great barber!"
                    className={`w-full p-3 rounded-xl border text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700 text-white placeholder:text-slate-600'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-500 shadow-xs font-medium'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition active:scale-95 shadow-xs"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
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
    </div>
  );
};
