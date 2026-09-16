import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronsRight, Check, Sparkles, UserCheck } from 'lucide-react';

interface SwipeToServeProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
  nextCustomerName?: string;
  nextCustomerToken?: string;
  customLabel?: string;
  compact?: boolean;
  successLabel?: string;
}

export const SwipeToServe: React.FC<SwipeToServeProps> = ({
  onSwipeComplete,
  disabled = false,
  nextCustomerName,
  nextCustomerToken,
  customLabel,
  compact = false,
  successLabel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(200);
  const [isSuccess, setIsSuccess] = useState(false);

  const thumbWidth = compact ? 46 : 56;

  // Measure track width dynamically
  useEffect(() => {
    const updateMaxDrag = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        const padding = 8;
        setMaxDrag(Math.max(40, trackWidth - thumbWidth - padding));
      }
    };

    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);
    return () => window.removeEventListener('resize', updateMaxDrag);
  }, [thumbWidth]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isSuccess) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled || isSuccess) return;
    if (!trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const currentX = e.clientX - trackRect.left - thumbWidth / 2;
    const clampedX = Math.max(0, Math.min(currentX, maxDrag));
    setDragX(clampedX);
  };

  const handlePointerUp = useCallback(() => {
    if (!isDragging || disabled || isSuccess) return;
    setIsDragging(false);

    // 70% threshold required to trigger confirmation
    const threshold = maxDrag * 0.7;
    if (dragX >= threshold) {
      // Snap to end & trigger success
      setDragX(maxDrag);
      setIsSuccess(true);

      // Light haptic vibration if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 40, 60]);
      }

      setTimeout(() => {
        onSwipeComplete();
        // Reset after short completion animation
        setTimeout(() => {
          setDragX(0);
          setIsSuccess(false);
        }, 500);
      }, 350);
    } else {
      // Snap back smoothly
      setDragX(0);
    }
  }, [isDragging, disabled, isSuccess, dragX, maxDrag, onSwipeComplete]);

  // Calculate progress ratio (0 to 1)
  const progress = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;

  const displayLabel = customLabel
    ? customLabel
    : disabled
    ? 'No customers waiting in queue'
    : nextCustomerToken
    ? `Swipe to Start ${nextCustomerToken}`
    : 'Swipe to Call Next Customer';

  return (
    <div className="w-full">
      {/* Helper text above swipe bar (only when not compact or explicitly provided) */}
      {!compact && (nextCustomerToken || nextCustomerName) && (
        <div className="flex items-center justify-between text-xs mb-2 text-[#334155] dark:text-[#94A3B8]">
          <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <UserCheck className="w-3.5 h-3.5" />
            Queue Progression Control
          </span>
          {nextCustomerToken ? (
            <span className="text-[#334155] dark:text-slate-300 font-medium">
              Next: <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-mono font-bold">{nextCustomerToken}</strong> ({nextCustomerName})
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-500 font-medium">Queue is Clear</span>
          )}
        </div>
      )}

      {/* Swipe Track Container */}
      <div
        ref={trackRef}
        className={`relative ${compact ? 'h-12' : 'h-16'} w-full rounded-2xl p-1 overflow-hidden transition duration-200 select-none ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
            : isSuccess
            ? 'bg-blue-50 dark:bg-blue-950/80 border border-blue-400/50 shadow-lg'
            : 'bg-[#E2E8F0] dark:bg-[#0B1120] border border-slate-300/80 dark:border-slate-800 shadow-inner'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Dynamic Filled Track Follower */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 transition-colors duration-200 ${
              isSuccess
                ? 'bg-blue-600/30'
                : 'bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-purple-600/20 dark:from-blue-900/40 dark:via-blue-600/30 dark:to-purple-600/30'
            }`}
            style={{
              transform: `translate3d(calc(-100% + ${Math.max(0, dragX + thumbWidth)}px), 0, 0)`,
              willChange: 'transform',
            }}
          />
        </div>

        {/* Centered Guide Label with Fade Out */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-10 transition-opacity duration-150"
          style={{ opacity: isSuccess ? 0 : 1 - progress * 1.5 }}
        >
          <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} font-bold tracking-wide text-[#0F172A] dark:text-slate-200 flex items-center gap-1.5`}>
            <span>{displayLabel}</span>
            {!disabled && <ChevronsRight className="w-4 h-4 text-blue-700 dark:text-blue-400 animate-pulse" />}
          </span>
        </div>

        {/* Success Feedback Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-blue-700 dark:text-blue-200 font-bold text-xs sm:text-sm tracking-wide animate-in fade-in zoom-in-95">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {successLabel || 'Turn Started!'}
            </span>
          </div>
        )}

        {/* Tactile Draggable Slider Thumb */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute top-1 bottom-1 ${compact ? 'w-11' : 'w-14'} rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-20 ${
            disabled
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              : isSuccess
              ? 'bg-blue-600 text-white shadow-blue-500/50'
              : 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-blue-600/30 hover:brightness-110 active:scale-95'
          }`}
          style={{
            transform: `translate3d(${dragX}px, 0, 0)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {isSuccess ? (
            <Check className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} animate-bounce`} />
          ) : (
            <div className="flex items-center justify-center">
              <ChevronsRight className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
