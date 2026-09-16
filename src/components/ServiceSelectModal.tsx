import React, { useState } from 'react';
import { Salon, Service } from '../types';
import { useAppStore } from '../store';
import { 
  X, 
  Check, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Ticket
} from 'lucide-react';

interface ServiceSelectModalProps {
  salon: Salon;
  onClose: () => void;
  onViewExistingToken: () => void;
}

export const ServiceSelectModal: React.FC<ServiceSelectModalProps> = ({
  salon,
  onClose,
  onViewExistingToken,
}) => {
  const { 
    activeCustomerToken, 
    currentUser,
    customerName, 
    customerPhone, 
    createCustomerToken,
    isDarkMode,
    queues,
  } = useAppStore();

  const [step, setStep] = useState<'select-services' | 'customer-details' | 'confirm-order'>('select-services');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([salon.services[0]?.id || '']);
  
  // Requirement 3: Pre-populate Name and Mobile number using active login session, keeping fields completely editable
  const [name, setName] = useState(currentUser?.name || customerName || '');
  const [phone, setPhone] = useState(currentUser?.phone || customerPhone || '');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const salonQueue = queues[salon.id] || [];
  const waitingCount = salonQueue.filter((t) => t.status === 'waiting').length;

  const categories = ['All', 'Hair', 'Beard', 'Spa', 'Color'];

  const filteredServices = salon.services.filter((svc) => {
    if (activeCategory === 'All') return true;
    return svc.category === activeCategory;
  });

  const selectedServices = salon.services.filter((svc) => selectedServiceIds.includes(svc.id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMins, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Requirement 2:
  // Tapping the Service Card or Service Name triggers SINGLE SELECT (deselects any previously selected service)
  const handleSelectServiceCard = (id: string) => {
    setSelectedServiceIds([id]);
  };

  // Requirement 2:
  // Tapping the Checkbox specifically allows MULTI SELECT (uses event.stopPropagation() so multiple services remain selected)
  const handleToggleCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleNextToDetails = () => {
    if (selectedServiceIds.length === 0) {
      setErrorMsg('Please select at least one service.');
      return;
    }
    setErrorMsg(null);
    // Ensure pre-fill is populated from session if fields were blank
    if (!name.trim() && (currentUser?.name || customerName)) {
      setName(currentUser?.name || customerName);
    }
    if (!phone.trim() && (currentUser?.phone || customerPhone)) {
      setPhone(currentUser?.phone || customerPhone);
    }
    setStep('customer-details');
  };

  const handleNextToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for turn alerts.');
      return;
    }
    setErrorMsg(null);
    setStep('confirm-order');
  };

  const handleGenerateToken = () => {
    // RULE OF SINGULARITY CHECK
    if (activeCustomerToken && (activeCustomerToken.status === 'waiting' || activeCustomerToken.status === 'serving')) {
      setErrorMsg(`You already have an active token (#${activeCustomerToken.tokenNumber}). Rule of Singularity requires completing or cancelling your current turn.`);
      return;
    }

    const result = createCustomerToken(salon.id, selectedServices, name, phone);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to generate token.');
    } else {
      onClose();
    }
  };

  const hasActiveToken = activeCustomerToken && (activeCustomerToken.status === 'waiting' || activeCustomerToken.status === 'serving');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border overflow-hidden shadow-2xl transition-colors duration-150 ${
          isDarkMode ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC]' : 'bg-white border-slate-200/90 text-[#0F172A]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${
          isDarkMode ? 'border-slate-800 bg-[#0B1120]/60' : 'border-slate-200/90 bg-[#F8FAFC]/90'
        }`}>
          <div className="flex items-center gap-2.5">
            {/* Requirement 6: Liquid Glass Back Button (ONLY icon, no text, scale-95 active animation) */}
            {step !== 'select-services' && (
              <button
                type="button"
                onClick={() => {
                  if (step === 'confirm-order') setStep('customer-details');
                  else if (step === 'customer-details') setStep('select-services');
                }}
                aria-label="Back"
                className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform duration-150 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white truncate max-w-[220px] sm:max-w-xs">
                {salon.name}
              </h2>
              <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-semibold">
                {step === 'select-services' && 'Step 1 of 3: Choose Services'}
                {step === 'customer-details' && 'Step 2 of 3: Customer Details'}
                {step === 'confirm-order' && 'Step 3 of 3: Confirm & Take Turn'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center text-[#0F172A] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* RULE OF SINGULARITY ALERT BANNER */}
        {hasActiveToken && (
          <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-500/30 p-3.5 text-amber-950 dark:text-amber-200 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Active Token in Progress: #{activeCustomerToken.tokenNumber}</div>
                <p className="text-[11px] text-amber-900 dark:text-amber-300 mt-0.5 leading-normal font-medium">
                  Per the Rule of Singularity, you can hold only 1 active salon turn at a time. View or cancel your existing token to join this queue.
                </p>
                <button
                  type="button"
                  onClick={onViewExistingToken}
                  className="mt-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                >
                  <Ticket className="w-3 h-3" />
                  View My Active Token (#{activeCustomerToken.tokenNumber})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/60 border-b border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* STEP 1: SELECT SERVICES */}
          {step === 'select-services' && (
            <div>
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-[#0B1120] text-slate-300 border border-slate-700/60 hover:text-white'
                        : 'bg-white text-[#334155] hover:text-[#0F172A] border border-slate-300 hover:border-slate-400 shadow-2xs'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Requirement 2 Hint */}
              <div className="mb-2 text-[11px] text-[#334155] dark:text-[#94A3B8] flex items-center justify-between px-1 font-medium">
                <span>Tap card to single-select • Tap checkbox to multi-select</span>
                <span className="font-bold text-blue-700 dark:text-blue-400">{selectedServiceIds.length} selected</span>
              </div>

              {/* Service Cards */}
              <div className="space-y-2.5">
                {filteredServices.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleSelectServiceCard(service.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition duration-150 flex items-start justify-between gap-3 ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-blue-950/40 border-blue-500/80 shadow-xs'
                            : 'bg-blue-50 border-blue-500 shadow-2xs'
                          : isDarkMode
                          ? 'bg-[#0B1120]/60 border-slate-700/60 hover:border-slate-600'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                            {service.name}
                          </h4>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-transparent">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#334155] dark:text-[#94A3B8] mt-1 line-clamp-2 font-medium leading-relaxed">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-black text-blue-700 dark:text-blue-400 font-mono text-sm">
                            ₹{service.price}
                          </span>
                          <span className="text-[#334155] dark:text-[#94A3B8] flex items-center gap-1 text-[11px] font-semibold">
                            <Clock className="w-3 h-3 text-slate-500" /> {service.durationMins} mins
                          </span>
                        </div>
                      </div>

                      {/* Requirement 2: Checkbox specifically allows MULTI SELECT with stopPropagation */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCheckbox(service.id, e)}
                        aria-label={`Toggle multi-select for ${service.name}`}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 transition active:scale-90 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : isDarkMode
                            ? 'border-slate-600 bg-slate-800 hover:border-slate-500'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER DETAILS (Requirement 3: Pre-populated and fully editable) */}
          {step === 'customer-details' && (
            <form onSubmit={handleNextToConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#0F172A] dark:text-[#94A3B8] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400 shadow-xs'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#0F172A] dark:text-[#94A3B8] mb-1.5">
                  Mobile Number (For Turn Alerts)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-[#0F172A] dark:text-slate-400 font-mono font-black">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone.replace(/^\+91\s?/, '')}
                    onChange={(e) => setPhone('+91 ' + e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    maxLength={10}
                    className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-[#0B1120] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400 shadow-xs'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#334155] dark:text-[#94A3B8] mt-1 font-medium">
                  We send notifications when your turn is approaching.
                </p>
              </div>

              {/* Selected Services Preview */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#0B1120]/80 border-slate-700/60' : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="text-xs font-black text-[#0F172A] dark:text-[#94A3B8] mb-2">
                  Selected Services ({selectedServices.length})
                </div>
                <div className="space-y-1.5 text-xs">
                  {selectedServices.map((svc) => (
                    <div key={svc.id} className="flex justify-between text-[#0F172A] dark:text-slate-200 font-medium">
                      <span>• {svc.name}</span>
                      <span className="font-mono font-black text-blue-700 dark:text-blue-400">₹{svc.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: CONFIRM ORDER */}
          {step === 'confirm-order' && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white">
                  Review Turn Booking
                </h3>
                <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-semibold">
                  Ready to take your digital turn at {salon.name}
                </p>
              </div>

              {/* Summary Card */}
              <div
                className={`rounded-2xl border p-4 space-y-3 ${
                  isDarkMode ? 'bg-[#0B1120]/80 border-slate-700/60' : 'bg-white border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/80 dark:border-slate-800">
                  <span className="text-[#334155] dark:text-[#94A3B8] font-bold">Customer:</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{name} ({phone})</span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[#0F172A] dark:text-[#94A3B8] block mb-1 font-bold">Services Breakdown:</span>
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-[#0F172A] dark:text-slate-300 pl-2 font-medium">
                      <span>• {s.name} ({s.durationMins}m)</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">₹{s.price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-[#334155] dark:text-[#94A3B8] block font-semibold">Total Est. Service Time</span>
                    <span className="text-sm font-black text-[#0F172A] dark:text-white">{totalDuration} minutes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#334155] dark:text-[#94A3B8] block font-semibold">Total Amount</span>
                    <span className="text-lg font-black font-mono text-blue-700 dark:text-blue-400">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* STRICT PAYMENT INTEGRITY COMPLIANCE */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs">
                <div className="flex items-center justify-between font-bold text-blue-950 dark:text-blue-200 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    Payment Method
                  </span>
                  <span className="text-blue-800 dark:text-white uppercase font-black tracking-wide bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-400/30">
                    Pay at Salon
                  </span>
                </div>
                <p className="text-[11px] text-blue-950 dark:text-blue-300/80 mt-1 font-medium">
                  No online payment collected now. Pay directly at the salon counter via Cash or UPI after your turn.
                </p>
              </div>

              {/* Live Queue Notice */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-xs text-[#0F172A] dark:text-slate-300 border border-slate-200 dark:border-transparent font-medium">
                <span>Current Queue Status:</span>
                <span className="font-bold text-amber-800 dark:text-amber-300">
                  {waitingCount} customer{waitingCount === 1 ? '' : 's'} waiting
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1120]/85 flex items-center justify-between gap-3">
          {step === 'select-services' && (
            <>
              <div>
                <div className="text-[11px] text-[#334155] dark:text-[#94A3B8] font-bold">
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {totalDuration}m
                </div>
                <div className="text-lg font-black font-mono text-blue-700 dark:text-blue-400">
                  ₹{totalPrice}
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextToDetails}
                disabled={selectedServiceIds.length === 0}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-blue-900/20 transition active:scale-95"
              >
                <span>Enter Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'customer-details' && (
            <>
              <button
                type="button"
                onClick={() => setStep('select-services')}
                className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-bold transition active:scale-95"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextToConfirm}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-blue-900/20 transition active:scale-95"
              >
                <span>Review Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'confirm-order' && (
            <>
              <button
                type="button"
                onClick={() => setStep('customer-details')}
                className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-300 text-xs font-bold transition active:scale-95"
              >
                Back
              </button>
              <button
                type="button"
                disabled={Boolean(hasActiveToken)}
                onClick={handleGenerateToken}
                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Token Pass</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
