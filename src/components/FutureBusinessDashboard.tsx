import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { BusinessType, BUSINESS_TYPES_CONFIG } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Stethoscope, 
  Utensils, 
  Wrench, 
  Landmark, 
  Scissors, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  LogOut,
  Building2,
  Users,
  Store,
  CalendarCheck,
  Layers
} from 'lucide-react';

interface FutureBusinessDashboardProps {
  businessType: BusinessType;
}

export const FutureBusinessDashboard: React.FC<FutureBusinessDashboardProps> = ({ businessType }) => {
  const { 
    currentUser, 
    isDarkMode, 
    setCurrentBusinessType, 
    logout, 
    businessAccounts,
    findBusinessAccount,
    setActiveTab
  } = useAppStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle Escape key and Back button for logout modal
  const pushedLogoutHistoryRef = React.useRef(false);
  const showLogoutConfirmRef = React.useRef(showLogoutConfirm);

  useEffect(() => {
    showLogoutConfirmRef.current = showLogoutConfirm;
    
    if (showLogoutConfirm && !pushedLogoutHistoryRef.current) {
      try {
        window.history.pushState({ modal: 'future-business-logout-confirm' }, '');
        pushedLogoutHistoryRef.current = true;
      } catch {}
    } else if (!showLogoutConfirm && pushedLogoutHistoryRef.current) {
      if (window.history.state?.modal === 'future-business-logout-confirm') {
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

  const config = BUSINESS_TYPES_CONFIG[businessType] || BUSINESS_TYPES_CONFIG.clinic;
  const currentAccount = currentUser?.phone ? findBusinessAccount(currentUser.phone) : undefined;
  const businessDisplayName = currentAccount?.businessName || currentUser?.name || 'My Registered Business';

  const getCategoryIcon = () => {
    switch (businessType) {
      case 'clinic':
        return <Stethoscope className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'restaurant':
        return <Utensils className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'service_center':
        return <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'government_office':
        return <Landmark className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <Store className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getArchitectureBlueprint = () => {
    switch (businessType) {
      case 'clinic':
        return {
          tokenPrefix: 'C-01',
          unitsLabel: 'Doctor Consultation Chambers',
          stages: ['Patient Vitals Check', 'Doctor OPD Chamber', 'Pharmacy / Prescription'],
          feature: 'OPD Appointment Tokens & Doctor Room Assignment',
        };
      case 'restaurant':
        return {
          tokenPrefix: 'R-01',
          unitsLabel: 'Dining Tables & Waitlist',
          stages: ['Party Size Check', 'Table Ready Alert', 'Order Placed & Kitchen Wait'],
          feature: 'Dine-In Table Buzzer & Takeaway Order Turns',
        };
      case 'service_center':
        return {
          tokenPrefix: 'S-01',
          unitsLabel: 'Service Bays & Technicians',
          stages: ['Vehicle Check-In', 'Bay Inspection & Repair', 'Washing & Ready for Pickup'],
          feature: 'Automotive Job-Card Bay Tracking & Service Milestones',
        };
      case 'government_office':
        return {
          tokenPrefix: 'G-01',
          unitsLabel: 'Citizen Service Windows',
          stages: ['Document Token Issued', 'Counter Verification', 'Approval & Certificate Desk'],
          feature: 'Multi-Window Citizen Tokens & Department Dispatch',
        };
      default:
        return {
          tokenPrefix: 'T-01',
          unitsLabel: 'Service Desks',
          stages: ['Token Assigned', 'Under Service', 'Completed'],
          feature: 'Live Queue & Turn Allocation',
        };
    }
  };

  const blueprint = getArchitectureBlueprint();

  return (
    <div className="px-4 py-5 space-y-5 animate-in fade-in duration-300">
      {/* 1. Top Business Identity Card */}
      <div
        className={`p-5 rounded-3xl border transition ${
          isDarkMode
            ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
            : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
              {getCategoryIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  {businessDisplayName}
                </h1>
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] font-medium mt-0.5">
                Owner: <span className="font-bold text-[#0F172A] dark:text-white">{currentUser?.name}</span> • {currentUser?.phone}
              </p>
            </div>
          </div>

          <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
            {config.statusBadge}
          </span>
        </div>

        {/* Business Type Confirmation Ribbon */}
        <div className="mt-4 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
              Saved Business Type: <strong className="font-black text-blue-700 dark:text-blue-300">{config.label}</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Verified Account
          </span>
        </div>
      </div>

      {/* 2. Future Dashboard Architecture Preview */}
      <div
        className={`p-5 rounded-3xl border transition space-y-4 ${
          isDarkMode
            ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
            : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
              {config.dashboardTitle}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
            Token Format: #{blueprint.tokenPrefix}
          </span>
        </div>

        <p className="text-xs text-[#334155] dark:text-[#94A3B8] leading-relaxed">
          The queue and token workflow for <strong>{config.label}</strong> is configured and saved for this business account.
          Our engineering team is actively rolling out dedicated chair/counter dispatch, live waiting room screens, and specialized turn stages for this vertical.
        </p>

        {/* Blueprint Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {blueprint.stages.map((stage, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B1120]/60 space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] font-black text-indigo-700 dark:text-indigo-400">
                <span>Stage 0{idx + 1}</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {stage}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-[#1E293B] dark:text-slate-300 space-y-0.5">
            <div className="font-bold text-[#0F172A] dark:text-white">
              Prepared Queue Feature: {blueprint.feature}
            </div>
            <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
              Your registered mobile number <strong>{currentUser?.phone}</strong> is tied directly to this business category. When the dedicated dispatch screens deploy, this account will automatically open the full {config.label} portal.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Action / Exploration Options */}
      <div
        className={`p-5 rounded-3xl border transition space-y-3.5 ${
          isDarkMode
            ? 'bg-[#131D31] border-slate-700/60'
            : 'bg-white border-slate-200/90'
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-[#475569] dark:text-[#94A3B8]">
          Owner Actions &amp; Testing
        </h3>

        <div className="space-y-2">
          {/* Option A: Preview the Active Salon Dashboard */}
          <button
            type="button"
            onClick={() => {
              setCurrentBusinessType('salon');
            }}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-md shadow-blue-900/20 transition active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BrandLogo size={16} />
              <span>Preview Live Salon &amp; Barber Shop Engine</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Option B: Explore Settings / More */}
          <button
            type="button"
            onClick={() => setActiveTab('more')}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>View Business Profile &amp; Register Another Branch</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Option C: Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Owner Portal</span>
          </button>
        </div>
      </div>

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
