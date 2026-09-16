import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppStore } from '../store';
import { BrandLogo } from './BrandLogo';
import { 
  Scissors, 
  Store, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Stethoscope,
  Utensils,
  Wrench,
  Landmark,
  X,
  AlertCircle
} from 'lucide-react';
import { BusinessType, BUSINESS_TYPES_CONFIG, getBusinessLoginTitle } from '../types';

export const LoginScreen: React.FC = () => {
  const { login, isDarkMode, findBusinessAccount, registerNewSalon } = useAppStore();
  const shouldReduceMotion = useReducedMotion();

  // Screen flow states: 'welcome' -> 'signup' (customer) or 'business_type_select' -> 'business_login'
  const [viewState, setViewState] = useState<
    'welcome' | 'signup' | 'business_type_select' | 'business_login'
  >('welcome');

  // Selected business type (only 'salon' is selectable/available)
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType>('salon');
  const [comingSoonNotice, setComingSoonNotice] = useState<string | null>(null);

  // Business login sub-tab: 'signin' | 'register'
  const [businessTab, setBusinessTab] = useState<'signin' | 'register'>('signin');

  // Customer Signup form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Business login credentials state
  const [bizPhone, setBizPhone] = useState('9811122334');
  const [bizPassword, setBizPassword] = useState('');
  const [showBizPassword, setShowBizPassword] = useState(false);

  // Business direct registration state (for new salon partner)
  const [regSalonName, setRegSalonName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regChairs, setRegChairs] = useState(2);
  const [regCity, setRegCity] = useState('Mumbai');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer Get Started submission
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Please enter a password with at least 4 characters.');
      return;
    }

    setErrorMsg(null);
    const formattedPhone = `+91 ${cleanDigits.slice(-10, -5)} ${cleanDigits.slice(-5)}`;
    // Account Created -> Category Screen
    login(name.trim(), formattedPhone, 'customer');
  };

  // Business Login submission
  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = bizPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter your 10-digit registered business number.');
      return;
    }
    if (!bizPassword && bizPassword.length < 4) {
      setErrorMsg('Please enter your business account password.');
      return;
    }

    setErrorMsg(null);
    const formattedPhone = `+91 ${cleanDigits.slice(-10, -5)} ${cleanDigits.slice(-5)}`;
    
    // Check registered Business Account
    const matchedAccount = findBusinessAccount(cleanDigits);
    if (matchedAccount) {
      login(
        matchedAccount.ownerName, 
        matchedAccount.phone || formattedPhone, 
        'business', 
        matchedAccount.businessType, 
        matchedAccount.salonId
      );
    } else {
      // Default to selected business type if account is not pre-indexed
      login('Salon Partner', formattedPhone, 'business', selectedBusinessType);
    }
  };

  // Business Direct Registration submission
  const handleBusinessRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSalonName.trim()) {
      setErrorMsg('Please enter your salon / shop name.');
      return;
    }
    if (!regOwnerName.trim()) {
      setErrorMsg('Please enter the owner full name.');
      return;
    }
    const cleanDigits = regMobile.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('Please choose a password with at least 4 characters.');
      return;
    }

    setErrorMsg(null);
    const formattedPhone = `+91 ${cleanDigits.slice(-10, -5)} ${cleanDigits.slice(-5)}`;

    const newSalonId = registerNewSalon({
      name: regSalonName.trim(),
      ownerName: regOwnerName.trim(),
      phone: formattedPhone,
      registeredPhone: formattedPhone,
      barbersCount: regChairs,
      seatsCount: regChairs,
      locality: `${regCity} Central`,
      address: `Shop 12, Main Market Road, ${regCity}`,
      city: regCity,
      openingTime: '09:00',
      closingTime: '21:00',
      businessType: 'salon',
    });

    login(regOwnerName.trim(), formattedPhone, 'business', 'salon', newSalonId);
  };

  // Quick fill helper for demo testing (Customer)
  const handleQuickCustomerDemo = () => {
    setName('Rahul Sharma');
    setPhone('9876543210');
    setPassword('pass1234');
  };

  // Quick fill helper for demo testing (Salon Partner - strictly generic, no personal names)
  const handleQuickSalonDemo = () => {
    setBizPhone('9811122334');
    setBizPassword('owner123');
    setErrorMsg(null);
  };

  // Helper icon for business types
  const renderTypeIcon = (typeId: BusinessType) => {
    switch (typeId) {
      case 'salon':
        return <Scissors className="w-5 h-5" />;
      case 'clinic':
        return <Stethoscope className="w-5 h-5" />;
      case 'restaurant':
        return <Utensils className="w-5 h-5" />;
      case 'service_center':
        return <Wrench className="w-5 h-5" />;
      case 'government_office':
        return <Landmark className="w-5 h-5" />;
      default:
        return <Store className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center px-4 py-8 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0B1120] text-[#F8FAFC]' : 'bg-[#F1F5F9] text-[#0F172A]'
      }`}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mx-auto">
            <BrandLogo size={56} />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Find My Token
              </h1>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                India
              </span>
            </div>

            <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-1">
              &ldquo;Your Turn. Without the Wait.&rdquo;
            </p>
          </div>

          <p className="text-xs text-[#334155] dark:text-[#94A3B8] max-w-xs mx-auto font-medium">
            Live queue management tailored for barber shops, salons &amp; walk-in appointments in India.
          </p>
        </div>

        {/* 1. WELCOME SCREEN (First-time / default view) */}
        {viewState === 'welcome' && (
          <motion.div
            key="welcome-card"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`rounded-3xl border p-6 transition space-y-6 ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            {/* Primary Action: Get Started */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewState('signup');
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#334155] dark:text-[#94A3B8] font-bold pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Live Queue Counters
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Zero Waiting Room Hassle
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200/90 dark:border-slate-800"></div>
              <span className="shrink mx-3 text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                Are you a business?
              </span>
              <div className="grow border-t border-slate-200/90 dark:border-slate-800"></div>
            </div>

            {/* Secondary Action: Business Login */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setComingSoonNotice(null);
                  setViewState('business_type_select');
                }}
                className={`w-full py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer ${
                  isDarkMode
                    ? 'border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-950/60 text-indigo-300'
                    : 'border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 shadow-2xs'
                }`}
              >
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Business Login</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. USER SIGNUP FLOW: Full-screen bottom-to-top slide-up transition */}
        <AnimatePresence>
          {viewState === 'signup' && (
            <motion.div
              key="signup-fullscreen-sheet"
              initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
              animate={{ y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`fixed inset-0 z-50 overflow-y-auto px-4 py-6 flex flex-col justify-start sm:justify-center items-center ${
                isDarkMode ? 'bg-[#0B1120] text-[#F8FAFC]' : 'bg-[#F1F5F9] text-[#0F172A]'
              }`}
            >
              <div className="w-full max-w-md my-auto space-y-4">
                <div
                  className={`rounded-3xl border p-6 transition space-y-4 shadow-2xl ${
                    isDarkMode
                      ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
                      : 'bg-white border-slate-200/90 shadow-[0_4px_25px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  {/* Header with Back button */}
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/90 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setViewState('welcome');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      Step 1 of 1
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                      Create Your Account
                    </h2>
                    <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                      Enter your details to take turn tokens &amp; track queues in real time.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-xs font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                            : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                        }`}
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                        Mobile Number (10 digits)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs sm:text-sm text-[#0F172A] dark:text-slate-300 font-mono font-black">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          maxLength={10}
                          className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                              : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password (min 4 characters)"
                          className={`w-full px-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                              : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#334155] dark:text-[#94A3B8] mt-1 font-medium">
                        Your session remains securely saved on this device.
                      </p>
                    </div>

                    {/* Submit CTA */}
                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                    >
                      <span>Create Account &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Quick Demo Pre-fill */}
                  <div className="pt-2 border-t border-slate-200/90 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleQuickCustomerDemo}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition text-center cursor-pointer"
                    >
                      ⚡ Quick Demo: Pre-fill Rahul Sharma (+91 98765 43210)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. BUSINESS TYPE SELECTION SCREEN (Category-focused, No personal names) */}
        {viewState === 'business_type_select' && (
          <motion.div
            key="business-type-select-card"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
            className={`rounded-3xl border p-6 transition space-y-4 ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            {/* Header with Back button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/90 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setComingSoonNotice(null);
                  setViewState('welcome');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Partner Portal
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                Select Business Category
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                Choose your business category to sign in or register your establishment.
              </p>
            </div>

            {/* Coming Soon Notice Banner if user tapped a disabled category */}
            {comingSoonNotice && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/40 text-amber-900 dark:text-amber-200 text-xs flex items-start justify-between gap-2 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="font-medium text-[11px] leading-relaxed">
                    {comingSoonNotice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setComingSoonNotice(null)}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* The 5 Business Categories List */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {Object.values(BUSINESS_TYPES_CONFIG).map((cat) => {
                const isAvailable = cat.status === 'available';

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (isAvailable) {
                        // Salon is selected: continue to Salon Owner Login / Registration
                        setSelectedBusinessType(cat.id);
                        setComingSoonNotice(null);
                        setErrorMsg(null);
                        setViewState('business_login');
                      } else {
                        // Tapping non-salon categories: do NOT open another page, do NOT start registration, do NOT navigate anywhere
                        setComingSoonNotice(
                          `${cat.label} queue management is Coming Soon. Only Salon & Barber Shop is available in this release.`
                        );
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                      isAvailable
                        ? 'border-blue-500/70 dark:border-blue-500/50 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 shadow-xs cursor-pointer active:scale-[0.99]'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 opacity-65 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isAvailable
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/25'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {renderTypeIcon(cat.id)}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                            {cat.label}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40'
                                : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700/50'
                            }`}
                          >
                            {cat.statusBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                          {cat.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAvailable ? (
                        <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 pt-1">
              Currently accepting registrations &amp; logins for <strong>Salon &amp; Barber Shop</strong> partners.
            </p>
          </motion.div>
        )}

        {/* 4. DYNAMIC BUSINESS LOGIN / REGISTRATION FLOW */}
        {viewState === 'business_login' && (
          <motion.div
            key="business-login-card"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
            className={`rounded-3xl border p-6 transition space-y-4 ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            {/* Header with Back button */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/90 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setViewState('business_type_select');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Categories</span>
              </button>

              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Partner Portal
              </span>
            </div>

            {/* Dynamic Business Login Title matching selected business type */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/40">
                  {BUSINESS_TYPES_CONFIG[selectedBusinessType]?.label || 'Salon & Barber Shop'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40">
                  {BUSINESS_TYPES_CONFIG[selectedBusinessType]?.statusBadge || 'AVAILABLE'}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
                {getBusinessLoginTitle(selectedBusinessType)}
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5">
                Manage barber chairs, live queue progression, and walk-in passes.
              </p>
            </div>

            {/* Toggle Tabs: Sign In vs Register Salon Details */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setBusinessTab('signin');
                }}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  businessTab === 'signin'
                    ? 'bg-white dark:bg-[#1E293B] text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Owner Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setBusinessTab('register');
                }}
                className={`flex-1 py-1.5 rounded-lg transition text-center cursor-pointer ${
                  businessTab === 'register'
                    ? 'bg-white dark:bg-[#1E293B] text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register Salon Details
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: OWNER SIGN IN */}
            {businessTab === 'signin' && (
              <form onSubmit={handleBusinessSubmit} className="space-y-3.5">
                {/* Business Mobile Number */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Registered Business Mobile
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs sm:text-sm text-[#0F172A] dark:text-slate-300 font-mono font-black">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      placeholder="98111 22334"
                      maxLength={10}
                      className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                          : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Business Password
                  </label>
                  <div className="relative">
                    <input
                      type={showBizPassword ? 'text' : 'password'}
                      value={bizPassword}
                      onChange={(e) => setBizPassword(e.target.value)}
                      placeholder="Enter owner password (e.g. owner123)"
                      className={`w-full px-3.5 pr-10 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode
                          ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                          : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowBizPassword(!showBizPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showBizPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Sign In to Owner Portal</span>
                </button>

                {/* Quick Demo Pre-fill (Category-focused, NO personal names) */}
                <div className="pt-2 border-t border-slate-200/90 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleQuickSalonDemo}
                    className="w-full py-2 px-3 rounded-lg border border-dashed border-blue-300 dark:border-blue-700/60 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ Quick Demo: Pre-fill Salon Partner Account (+91 98111 22334)</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER SALON BUSINESS DETAILS */}
            {businessTab === 'register' && (
              <form onSubmit={handleBusinessRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Salon / Barber Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regSalonName}
                    onChange={(e) => setRegSalonName(e.target.value)}
                    placeholder="e.g. Royal Fade &amp; Shave Lounge"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Owner Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regOwnerName}
                    onChange={(e) => setRegOwnerName(e.target.value)}
                    placeholder="e.g. Store Owner Name"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Registered Mobile (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="e.g. 98123 45678"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Barber Chairs
                    </label>
                    <select
                      value={regChairs}
                      onChange={(e) => setRegChairs(Number(e.target.value))}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC]'
                          : 'bg-white border-slate-300 text-[#0F172A]'
                      }`}
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Chair' : 'Chairs'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      City
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC]'
                          : 'bg-white border-slate-300 text-[#0F172A]'
                      }`}
                    >
                      {['Mumbai', 'Delhi NCR', 'Bengaluru', 'Jaipur', 'Pune', 'Hyderabad', 'Kolkata'].map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Set Owner Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (min 4 characters)"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-black shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Register Salon &amp; Open Portal</span>
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* Feature Highlights Footer (Updated: Pay at Partner Location) */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-[#334155] dark:text-[#94A3B8] font-medium">
          <div className="p-2">
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <span>Dynamic Wait Times</span>
          </div>
          <div className="p-2">
            <Sparkles className="w-4 h-4 mx-auto mb-1 text-indigo-600 dark:text-indigo-400" />
            <span>Retro Turn Pass</span>
          </div>
          <div className="p-2">
            <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <span>Pay at Partner Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};
