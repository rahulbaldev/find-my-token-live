import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { BrandLogo } from './BrandLogo';
import { BarberServingCard } from './BarberServingCard';
import { SwipeToServe } from './SwipeToServe';
import { Barber, QueueToken } from '../types';
import { checkSalonOpenStatus } from '../utils/salonSchedule';
import { 
  Users, 
  Scissors, 
  Clock, 
  Plus, 
  MoreVertical, 
  RotateCcw, 
  UserPlus, 
  Store, 
  CheckCircle2, 
  ChevronDown,
  AlertTriangle,
  Sparkles,
  Phone,
  Power,
  Check,
  History,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const {
    salons,
    queues,
    businessSalonId,
    setBusinessSalonId,
    activeTab,
    setActiveTab,
    finishCustomerToken,
    startServingCustomer,
    toggleBarberActiveStatus,
    advanceQueue,
    revertLastQueueAction,
    lastQueueProgression,
    addWalkInToken,
    toggleSalonOpenStatus,
    updateActiveBarbersCount,
    isDarkMode,
    currentUser,
  } = useAppStore();

  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 5-Second Accidental Finish Undo Toast State
  const [undoToast, setUndoToast] = useState<{
    tokenNumber: string;
    customerName: string;
    barberName: string;
    expiresAt: number;
  } | null>(null);

  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState<string[]>([]);
  const [walkInBarber, setWalkInBarber] = useState('');

  const currentSalon =
    salons.find((s) => s.id === businessSalonId) ||
    salons.find((s) => s.id === currentUser?.businessId) ||
    salons.find((s) => currentUser?.phone && (
      (s.registeredPhone && s.registeredPhone.replace(/[^0-9]/g, '').slice(-10) === currentUser.phone.replace(/[^0-9]/g, '').slice(-10)) ||
      (s.phone && s.phone.replace(/[^0-9]/g, '').slice(-10) === currentUser.phone.replace(/[^0-9]/g, '').slice(-10))
    )) ||
    salons[0];

  const registeredPhoneDisplay =
    currentSalon.registeredPhone ||
    currentSalon.phone ||
    currentUser?.phone ||
    '+91 98111 22334';
  const queue = queues[currentSalon.id] || [];

  const servingTokens = queue.filter((t) => t.status === 'serving');
  const waitingTokens = queue.filter((t) => t.status === 'waiting');
  const completedTokens = queue.filter((t) => t.status === 'completed');
  const cancelledTokens = queue.filter((t) => t.status === 'cancelled');

  const scheduleStatus = checkSalonOpenStatus(currentSalon);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  // 1-TAP FINISH ACTION WITH 5-SECOND ACCIDENTAL FINISH PROTECTION
  const handleFinishToken = (tokenId: string, barberId: string) => {
    const token = queue.find((t) => t.id === tokenId);
    const barber = currentSalon.barbers.find((b) => b.id === barberId);

    const tokenNumber = token?.tokenNumber || 'Token';
    const customerName = token?.customerName || 'Customer';
    const barberName = barber?.name || 'Barber';

    // Execute finish in store
    finishCustomerToken(currentSalon.id, tokenId, barberId);

    // Set 5-second undo toast
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    setUndoToast({
      tokenNumber,
      customerName,
      barberName,
      expiresAt: Date.now() + 5000,
    });

    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null);
    }, 5000);
  };

  // UNDO ACTION FOR 5-SECOND TOAST
  const handleUndoFinish = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    const tokenNum = undoToast?.tokenNumber || '';
    setUndoToast(null);

    const result = revertLastQueueAction(currentSalon.id);
    setFeedbackNotice(result.success ? `Restored #${tokenNum} to chair!` : result.message);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // MANUAL REVERT FROM OPTIONS MENU
  const handleMenuRevert = () => {
    setShowOptionsMenu(false);
    const result = revertLastQueueAction(currentSalon.id);
    setFeedbackNotice(result.message);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // START SERVING NEXT TOKEN FOR A SPECIFIC BARBER
  const handleStartNextToken = (barberId: string, tokenId: string) => {
    const result = startServingCustomer(currentSalon.id, barberId, tokenId);
    if (result.success && result.startedToken) {
      setFeedbackNotice(`Started #${result.startedToken.tokenNumber} (${result.startedToken.customerName})!`);
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  // SUBMIT WALK-IN CUSTOMER
  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    addWalkInToken(
      currentSalon.id,
      walkInName,
      walkInPhone || '+91 99000 00000',
      walkInServices.length > 0 ? walkInServices : [currentSalon.services[0].id],
      walkInBarber || undefined
    );

    setWalkInName('');
    setWalkInPhone('');
    setWalkInServices([]);
    setWalkInBarber('');
    setShowWalkInModal(false);

    setFeedbackNotice('Walk-in customer added to queue!');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Helper to map barbers to serving tokens
  // If a token explicitly specifies an assignedBarberId or assignedBarber, link it.
  // Otherwise, match unassigned serving tokens with available active barbers.
  const assignedServingMap = new Map<string, QueueToken>();
  const unassignedServingTokens: QueueToken[] = [];

  servingTokens.forEach((tok) => {
    if (tok.assignedBarberId) {
      assignedServingMap.set(tok.assignedBarberId, tok);
    } else if (tok.assignedBarber) {
      const matched = currentSalon.barbers.find((b) => b.name === tok.assignedBarber);
      if (matched) {
        assignedServingMap.set(matched.id, tok);
      } else {
        unassignedServingTokens.push(tok);
      }
    } else {
      unassignedServingTokens.push(tok);
    }
  });

  // Assign any remaining serving tokens to active barbers without tokens
  currentSalon.barbers.forEach((barber) => {
    if (!assignedServingMap.has(barber.id) && unassignedServingTokens.length > 0 && barber.isActive !== false) {
      const nextUnassigned = unassignedServingTokens.shift();
      if (nextUnassigned) {
        assignedServingMap.set(barber.id, nextUnassigned);
      }
    }
  });

  // Find next waiting tokens for available barbers
  // We allocate waiting tokens sequentially to available barbers
  const availableBarbers = currentSalon.barbers.filter(
    (b) => b.isActive !== false && !assignedServingMap.has(b.id)
  );

  const nextWaitingForBarberMap = new Map<string, QueueToken>();
  availableBarbers.forEach((barber, index) => {
    if (waitingTokens[index]) {
      nextWaitingForBarberMap.set(barber.id, waitingTokens[index]);
    }
  });

  const activeBarbersCount = currentSalon.barbers.filter((b) => b.isActive !== false).length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-5">
      {/* 5-SECOND ACCIDENTAL FINISH PROTECTION TOAST */}
      {undoToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B1120] text-white border border-blue-500/50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate">
              Token #{undoToast.tokenNumber} completed
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {undoToast.customerName} • {undoToast.barberName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleUndoFinish}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Generic feedback notice */}
      {feedbackNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* CONDITIONAL TAB VIEWS */}

      {/* VIEW A: DASHBOARD (4-BARBER SIMULTANEOUS SERVING LAYOUT) */}
      {activeTab === 'home' && (
        <div className="space-y-5">
          {/* TOP HEADER CARD: SALON IDENTITY & STATUS CONTROLS (Dashboard tab ONLY) */}
          <div
            className={`rounded-3xl p-5 border transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              {/* Non-Editable Salon Identity Display */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-blue-700 dark:text-blue-400 mb-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Active Salon Dashboard</span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC] truncate uppercase">
                  {currentSalon.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Phone className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    {registeredPhoneDisplay}
                  </span>
                  {currentSalon.locality && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] text-[#475569] dark:text-[#94A3B8] font-semibold truncate">
                        {currentSalon.locality}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Three-dots menu (for Revert Action & Admin tools) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className={`p-2.5 rounded-xl border transition active:scale-95 ${
                    isDarkMode
                      ? 'border-slate-700/60 bg-slate-800/80 hover:bg-slate-800 text-[#F8FAFC]'
                      : 'border-slate-200/90 bg-white hover:bg-slate-100 text-[#0F172A]'
                  }`}
                  title="More Actions"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showOptionsMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl z-30 p-1.5 animate-in fade-in zoom-in-95 ${
                      isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  >
                    <div className="px-3 py-2 text-[11px] font-bold text-[#334155] dark:text-[#94A3B8] border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider">
                      Dashboard Controls
                    </div>

                    {/* REVERT ACTION MANDATE */}
                    <button
                      type="button"
                      disabled={!lastQueueProgression || lastQueueProgression.salonId !== currentSalon.id}
                      onClick={handleMenuRevert}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-300 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-2 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Undo Last Queue Advancement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowWalkInModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2 transition"
                    >
                      <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Add Walk-In Customer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleSalonOpenStatus(currentSalon.id);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-slate-300 flex items-center gap-2 transition"
                    >
                      <Power className="w-4 h-4 text-[#334155] dark:text-slate-400" />
                      <span>Toggle Salon Open/Closed</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Operational Status & Barbers Bar */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              {/* Salon Status with automatic schedule logic */}
              <div className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
              }`}>
                <div>
                  <span className="text-[#0F172A] dark:text-[#94A3B8] font-bold block text-[11px]">
                    Operating Status
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentSalon.openingHours}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSalonOpenStatus(currentSalon.id)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center gap-1.5 ${
                    scheduleStatus.isOpen
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      scheduleStatus.isOpen ? 'bg-blue-600 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  {scheduleStatus.isOpen ? 'OPEN' : 'CLOSED'}
                </button>
              </div>

              {/* Active Barbers Summary */}
              <div className={`flex items-center justify-between p-2.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-[#F8FAFC] border-slate-200/90'
              }`}>
                <div>
                  <span className="text-[#0F172A] dark:text-[#94A3B8] font-bold block text-[11px]">
                    Active Chairs
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentSalon.barbers.length} Total Registered
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-blue-700 dark:text-blue-400 font-mono text-base">
                    {activeBarbersCount}
                  </span>
                  <span className="text-[11px] text-[#334155] dark:text-slate-400 font-bold">
                    / {currentSalon.barbers.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* SECTION HEADER: CURRENTLY SERVING */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <BrandLogo size={16} className="grayscale mix-blend-luminosity opacity-80" />
                <span>Currently Serving ({assignedServingMap.size} in Chairs)</span>
              </h3>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium">
                1-tap finish per barber. Next waiting customer queues automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Walk-in</span>
            </button>
          </div>

          {/* 4-BARBER LAYOUT (SIMULTANEOUS VIEW) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentSalon.barbers.map((barber) => {
              const servingTok = assignedServingMap.get(barber.id);
              const nextWaitingTok = nextWaitingForBarberMap.get(barber.id);

              return (
                <BarberServingCard
                  key={barber.id}
                  barber={barber}
                  servingToken={servingTok}
                  nextWaitingToken={nextWaitingTok}
                  onFinishToken={handleFinishToken}
                  onStartNextToken={handleStartNextToken}
                  onOpenWalkInModal={() => setShowWalkInModal(true)}
                  isDarkMode={isDarkMode}
                />
              );
            })}
          </div>

          {/* NEXT IN LINE SUMMARY CARD */}
          <div
            className={`rounded-3xl p-5 border transition ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                  Waiting Queue ({waitingTokens.length} Customers)
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('live_queue')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {waitingTokens.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                <p className="font-bold text-[#0F172A] dark:text-slate-300">
                  No customers waiting in line right now.
                </p>
                <p className="text-[11px] text-[#334155] dark:text-slate-400 mt-0.5">
                  Customers booking online will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {waitingTokens.slice(0, 3).map((tok, idx) => (
                  <div
                    key={tok.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      idx === 0
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
                        : isDarkMode
                        ? 'bg-[#0B1120]/60 border-slate-700/60'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                            #{tok.tokenNumber}
                          </span>
                          <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {tok.customerName}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#334155] dark:text-slate-400 truncate">
                          {tok.services.map((s) => s.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                        ~{tok.totalDurationMins}m
                      </span>
                      <span className="block text-[10px] text-slate-500 font-semibold">
                        ₹{tok.totalPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW B: LIVE QUEUE VIEW */}
      {activeTab === 'live_queue' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Live Salon Queue</span>
              </h3>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
                {servingTokens.length} Serving • {waitingTokens.length} Waiting
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWalkInModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Walk-in</span>
            </button>
          </div>

          {/* Currently In Chairs */}
          <div
            className={`rounded-3xl p-5 border ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-1.5">
              <BrandLogo size={16} className="grayscale mix-blend-luminosity opacity-80" />
              <span>Currently in Barber Chairs ({servingTokens.length})</span>
            </h4>

            {servingTokens.length === 0 ? (
              <p className="text-xs text-[#334155] dark:text-slate-400 py-3 text-center">
                All chairs are currently idle.
              </p>
            ) : (
              <div className="space-y-2.5">
                {servingTokens.map((tok) => (
                  <div
                    key={tok.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-[#0B1120]/70 border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs">
                        #{tok.tokenNumber}
                      </span>
                      <div>
                        <div className="text-sm font-black text-[#0F172A] dark:text-white">
                          {tok.customerName}
                        </div>
                        <div className="text-xs text-[#334155] dark:text-slate-400">
                          {tok.services.map((s) => s.name).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {tok.assignedBarber ? `Barber: ${tok.assignedBarber}` : 'In Service'}
                      </span>
                      <span className="block text-[11px] text-slate-500 font-mono">
                        ~{tok.totalDurationMins} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Waiting Queue List */}
          <div
            className={`rounded-3xl p-5 border ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Waiting Line ({waitingTokens.length})</span>
            </h4>

            {waitingTokens.length === 0 ? (
              <div className="p-6 text-center text-xs space-y-1">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-[#0F172A] dark:text-white">The waiting line is clear</p>
                <p className="text-[#334155] dark:text-slate-400">
                  New customer tokens will appear here dynamically.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {waitingTokens.map((tok, idx) => (
                  <div
                    key={tok.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      idx === 0
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/60'
                        : isDarkMode
                        ? 'bg-[#0B1120]/60 border-slate-700/60'
                        : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                            #{tok.tokenNumber}
                          </span>
                          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {tok.customerName}
                          </span>
                          {tok.isWalkIn && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-black">
                              Walk-in
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#334155] dark:text-slate-400">
                          {tok.services.map((s) => s.name).join(', ')} • {tok.totalDurationMins}m
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                        ₹{tok.totalPrice}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        Pay at Salon
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW C: HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Queue & Service History</span>
            </h3>
            <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
              Records of completed and cancelled turns for {currentSalon.name}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase">Completed</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                {completedTokens.length}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase">Est. Revenue</div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                ₹{completedTokens.reduce((sum, t) => sum + (t.totalPrice || 0), 0)}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#131D31] border-slate-700/60' : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="text-[10px] font-bold text-slate-500 uppercase">Cancelled</div>
              <div className="text-lg font-black text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                {cancelledTokens.length}
              </div>
            </div>
          </div>

          {/* History List */}
          <div
            className={`rounded-3xl p-5 border ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-3">
              Today&apos;s Finished Services
            </h4>

            {completedTokens.length === 0 ? (
              <p className="text-xs text-[#334155] dark:text-slate-400 py-6 text-center">
                No tokens have been completed today yet.
              </p>
            ) : (
              <div className="space-y-2">
                {completedTokens.map((tok) => (
                  <div
                    key={tok.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs font-mono">
                        ✓
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                            #{tok.tokenNumber}
                          </span>
                          <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                            {tok.customerName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#334155] dark:text-slate-400">
                          {tok.services.map((s) => s.name).join(', ')}
                          {tok.assignedBarber && ` • Barber: ${tok.assignedBarber}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-black text-[#0F172A] dark:text-white">
                        ₹{tok.totalPrice}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Paid at Salon
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WALK-IN CUSTOMER CHECK-IN MODAL */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`border rounded-3xl p-6 max-w-md w-full shadow-2xl transition ${
              isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC]">
                <UserPlus className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                Register Walk-in Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#334155] dark:text-slate-400 transition font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#0F172A] dark:text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Anand Murthy"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">
                  Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                />
              </div>

              {/* Preferred Barber */}
              <div>
                <label className="block text-[#0F172A] dark:text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">
                  Assign to Barber (Optional)
                </label>
                <select
                  value={walkInBarber}
                  onChange={(e) => setWalkInBarber(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                  }`}
                >
                  <option value="">Any Available Barber</option>
                  {currentSalon.barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.barberNumber || `Seat ${b.seatNumber}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#0F172A] dark:text-[#94A3B8] font-bold mb-1.5 uppercase tracking-wider">
                  Select Services
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {currentSalon.services.map((svc) => {
                    const isSelected = walkInServices.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setWalkInServices(walkInServices.filter((id) => id !== svc.id));
                          } else {
                            setWalkInServices([...walkInServices, svc.id]);
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-900 dark:text-white font-bold'
                            : isDarkMode
                            ? 'bg-[#0B1120] border-slate-700/60 text-slate-300 hover:border-slate-600'
                            : 'bg-[#F8FAFC] border-slate-200/90 text-[#0F172A] hover:border-slate-300 font-medium'
                        }`}
                      >
                        <span className="truncate">{svc.name}</span>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400 shrink-0 ml-2">
                          ₹{svc.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold transition ${
                    isDarkMode
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-[#0F172A]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-900/20 active:scale-95 transition"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
