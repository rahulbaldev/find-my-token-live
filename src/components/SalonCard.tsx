import React, { useRef, useEffect } from 'react';
import { Salon, QueueToken } from '../types';
import { BrandLogo } from './BrandLogo';
import { Star, MapPin, Users, Scissors, Clock, ChevronRight } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  queue: QueueToken[];
  onSelectSalon: (salon: Salon) => void;
  isDarkMode: boolean;
}

export const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  queue,
  onSelectSalon,
  isDarkMode,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const waitingCount = queue.filter((t) => t.status === 'waiting').length;
  const activeBarbers = Math.max(1, salon.activeBarbersCount);

  // Estimated wait time calculation for a new customer
  const totalWaitingDuration = queue
    .filter((t) => t.status === 'waiting')
    .reduce((sum, t) => sum + t.totalDurationMins, 0);
  const estWaitMins = Math.max(5, Math.round(totalWaitingDuration / activeBarbers));

  // Subtle scroll physics: Card becomes slightly more prominent (1.00 -> 1.02) when moving through the active viewport area
  useEffect(() => {
    let ticking = false;

    const handleScrollPhysics = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 800;

      // Distance of card center from viewport center
      const cardCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distanceFromCenter = Math.abs(cardCenter - viewportCenter);

      // Card is prominent within active reading area
      const maxDistance = viewportHeight * 0.55;
      const proximity = Math.max(0, 1 - distanceFromCenter / maxDistance);

      // Subtle scale factor between 1.00 and 1.02
      const targetScale = (1 + proximity * 0.02).toFixed(3);
      cardRef.current.style.transform = `scale3d(${targetScale}, ${targetScale}, 1)`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScrollPhysics);
        ticking = true;
      }
    };

    handleScrollPhysics();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        transform: 'scale3d(1, 1, 1)',
        transformOrigin: 'center center',
        transition: 'transform 0.12s cubic-bezier(0.2, 0.9, 0.3, 1)',
      }}
      className={`rounded-3xl overflow-hidden border will-change-transform active:scale-[0.99] ${
        isDarkMode
          ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
          : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.09)]'
      }`}
    >
      {/* Top Banner Image with Status Overlays */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 ease-out hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

        {/* Top Badges (No green branding) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 ${
              salon.isOpen
                ? 'bg-blue-950/85 border border-blue-400/40 text-blue-100'
                : 'bg-slate-950/85 border border-slate-600/40 text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                salon.isOpen ? 'bg-blue-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {salon.isOpen ? 'Open Now' : 'Closed'}
          </span>

          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            {salon.rating} ({salon.totalReviews})
          </span>
        </div>

        {/* Bottom Image Info: Locality & Hours */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black leading-snug drop-shadow-md text-white">{salon.name}</h3>
          <p className="text-xs text-slate-100 flex items-center gap-1 mt-0.5 font-semibold drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{salon.locality}, {salon.city}</span>
          </p>
        </div>
      </div>

      {/* Body: Live Salon Stats & Queue Info */}
      <div className="p-4">
        <p className="text-xs text-[#334155] dark:text-[#94A3B8] mb-3 line-clamp-1 italic font-semibold">
          &ldquo;{salon.tagline}&rdquo;
        </p>

        {/* Live Queue Indicators */}
        <div
          className={`grid grid-cols-3 gap-2 p-3 rounded-2xl mb-4 text-center ${
            isDarkMode ? 'bg-[#0B1120]/70 border border-slate-700/60' : 'bg-[#F8FAFC] border border-slate-200/90'
          }`}
        >
          <div>
            <div className="text-[10px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              In Line
            </div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400">
              {waitingCount}
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">waiting</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Est. Wait
            </div>
            <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">
              ~{estWaitMins}m
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">queue duration</div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-extrabold text-[#334155] dark:text-[#94A3B8] flex items-center justify-center gap-1">
              <BrandLogo size={12} className="grayscale mix-blend-luminosity opacity-80" />
              Barbers
            </div>
            <div className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
              {activeBarbers}
            </div>
            <div className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold">active chairs</div>
          </div>
        </div>

        {/* Sample Services Preview */}
        <div className="mb-4">
          <div className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1.5 flex justify-between">
            <span>Popular Services</span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 font-extrabold">
              Starts ₹{salon.services[0]?.price}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {salon.services.slice(0, 3).map((service) => (
              <span
                key={service.id}
                className={`text-[11px] px-2.5 py-1 rounded-xl border font-semibold ${
                  isDarkMode
                    ? 'bg-[#0B1120]/60 border-slate-700/60 text-slate-200'
                    : 'bg-[#F1F5F9] border-slate-200/90 text-[#0F172A]'
                }`}
              >
                {service.name} • <span className="font-extrabold text-blue-700 dark:text-blue-400">₹{service.price}</span>
              </span>
            ))}
          </div>
        </div>

        {/* STRICT FLOW: Salon List -> View Services -> Select Service -> Customer Details -> Confirm Order Modal -> Get Token */}
        <button
          type="button"
          onClick={() => onSelectSalon(salon)}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <span>View Services & Live Queue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
