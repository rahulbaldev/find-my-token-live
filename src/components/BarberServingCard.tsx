import React from 'react';
import { Barber, QueueToken } from '../types';
import { BrandLogo } from './BrandLogo';
import { SwipeToServe } from './SwipeToServe';
import { 
  Check, 
  Clock, 
  Sparkles, 
  User, 
  UserX, 
  Plus, 
  ShieldAlert, 
  Scissors,
  CheckCircle2,
  Power,
  Phone
} from 'lucide-react';

interface BarberServingCardProps {
  barber: Barber;
  servingToken?: QueueToken;
  nextWaitingToken?: QueueToken;
  onFinishToken: (tokenId: string, barberId: string) => void;
  onStartNextToken: (barberId: string, tokenId: string) => void;
  onOpenWalkInModal: () => void;
  isDarkMode: boolean;
}

export const BarberServingCard: React.FC<BarberServingCardProps> = ({
  barber,
  servingToken,
  nextWaitingToken,
  onFinishToken,
  onStartNextToken,
  onOpenWalkInModal,
  isDarkMode,
}) => {
  const isInactive = barber.isActive === false;
  const isServing = Boolean(servingToken && !isInactive);
  const isAvailable = !isServing && !isInactive;

  return (
    <div
      className={`rounded-3xl border transition duration-200 overflow-hidden flex flex-col justify-between ${
        isInactive
          ? isDarkMode
            ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
            : 'bg-slate-100/80 border-slate-200/80 opacity-75'
          : isDarkMode
          ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:border-blue-500/30'
          : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:border-blue-200'
      }`}
    >
      {/* Top Card Header: Barber Info & Status */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/70">
        <div className="flex items-start justify-between gap-3">
          {/* Barber Avatar & Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {barber.photo ? (
                <img
                  src={barber.photo}
                  alt={barber.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base">
                  {barber.name.charAt(0)}
                </div>
              )}
              {/* Online / Active status dot (Blue/Purple or Slate) */}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${
                  isDarkMode ? 'border-[#131D31]' : 'border-white'
                } ${
                  isInactive
                    ? 'bg-slate-500'
                    : isServing
                    ? 'bg-blue-600 animate-pulse'
                    : 'bg-purple-500'
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {barber.barberNumber || `Seat #${barber.seatNumber || 1}`}
                </span>
                {barber.seatNumber && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#334155] dark:text-[#94A3B8] font-bold">
                    Chair {barber.seatNumber}
                  </span>
                )}
              </div>
              <h4 className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {barber.name}
              </h4>
            </div>
          </div>

          {/* Barber Status Badge (Display Only) */}
          <div className="flex flex-col items-end gap-1.5">
            {isInactive ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Off-duty
              </span>
            ) : isServing ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                Serving
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700/60">
                Available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {isInactive ? (
          /* STATE: Inactive / Off-Duty (Display Only) */
          <div className="py-6 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Barber is Off-Duty
              </p>
              <p className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                Chair is paused and excluded from queue calculations.
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                Manage duty status in More → Active Barbers
              </p>
            </div>
          </div>
        ) : isServing && servingToken ? (
          /* STATE: Currently Serving Customer */
          <div className="space-y-4">
            {/* Customer & Token Highlight Card */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode
                  ? 'bg-[#0B1120]/70 border-slate-700/60'
                  : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-black text-sm tracking-wide shadow-xs">
                    {servingToken.tokenNumber}
                  </span>
                  {servingToken.isWalkIn && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-extrabold">
                      Walk-in
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#334155] dark:text-[#94A3B8] font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  ~{servingToken.totalDurationMins} mins
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {servingToken.customerName}
                </div>
                <div className="text-xs text-[#334155] dark:text-[#94A3B8] truncate flex items-center gap-1.5">
                  <BrandLogo size={12} className="grayscale mix-blend-luminosity opacity-80 shrink-0" />
                  <span>{servingToken.services.map((s) => s.name).join(', ')}</span>
                </div>
                <div className="text-[11px] text-[#334155] dark:text-[#94A3B8] font-mono">
                  {servingToken.customerPhone}
                </div>
              </div>
            </div>

            {/* ONE-TAP FINISH ACTION */}
            <div>
              <button
                type="button"
                onClick={() => onFinishToken(servingToken.id, barber.id)}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm tracking-wide transition shadow-[0_4px_16px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Finish Token {servingToken.tokenNumber}</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE: Available (Ready for next customer) */
          <div className="space-y-3">
            {nextWaitingToken ? (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    isDarkMode
                      ? 'bg-[#0B1120]/60 border-slate-700/60'
                      : 'bg-purple-50/60 border-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Next in Line
                    </span>
                    <span className="font-mono font-black text-sm text-[#0F172A] dark:text-white">
                      {nextWaitingToken.tokenNumber}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                    {nextWaitingToken.customerName}
                  </p>
                  <p className="text-[11px] text-[#334155] dark:text-[#94A3B8] truncate">
                    {nextWaitingToken.services.map((s) => s.name).join(', ')}
                  </p>
                </div>

                {/* SWIPE TO START NEXT TOKEN */}
                <SwipeToServe
                  compact={true}
                  customLabel={`Swipe to Start ${nextWaitingToken.tokenNumber}`}
                  successLabel={`Started ${nextWaitingToken.tokenNumber}!`}
                  onSwipeComplete={() => onStartNextToken(barber.id, nextWaitingToken.id)}
                />
              </div>
            ) : (
              /* No waiting tokens in queue */
              <div className="py-4 text-center space-y-2">
                <div className="w-9 h-9 mx-auto rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Chair Ready & Available
                  </p>
                  <p className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                    No waiting customers in the digital queue right now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenWalkInModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Walk-in Customer</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
