import React, { useState } from 'react';
import { useAppStore } from '../store';
import { BrandLogo } from './BrandLogo';
import { 
  Scissors, 
  Stethoscope, 
  Building2, 
  UtensilsCrossed, 
  Landmark, 
  FileText, 
  Wrench, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';

interface CategoryScreenProps {
  onSelectCategory: (categoryId: string) => void;
}

interface CategoryItem {
  id: string;
  name: string;
  tagline: string;
  badge: 'Available' | 'Coming Soon';
  isAvailable: boolean;
  icon: React.ComponentType<{ className?: string }>;
  liveCount?: string;
  description: string;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({ onSelectCategory }) => {
  const { isDarkMode, currentUser } = useAppStore();
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  const categories: CategoryItem[] = [
    {
      id: 'salons',
      name: 'Salons',
      tagline: 'Barber shops, hair styling & grooming lounges',
      badge: 'Available',
      isAvailable: true,
      icon: Scissors,
      liveCount: '4 Locations Live',
      description: 'Check live turn counter, view queue lengths & take digital tokens.',
    },
    {
      id: 'clinics',
      name: 'Clinics',
      tagline: 'General physicians, pediatric & dental OPD queues',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: Stethoscope,
      description: 'Doctor consultation tokens & live OPD turn tracking.',
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      tagline: 'Multi-speciality OPD, pharmacy & diagnostic lab queues',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: Building2,
      description: 'Departmental turn passes and registration counters.',
    },
    {
      id: 'restaurants',
      name: 'Restaurants & Cafes',
      tagline: 'Table waitlist & dine-in turn passes',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: UtensilsCrossed,
      description: 'Skip crowded entry queues with instant SMS/push turn alerts.',
    },
    {
      id: 'banks',
      name: 'Banks & Financial Hubs',
      tagline: 'Teller counters, cash deposit & relationship desks',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: Landmark,
      description: 'Digital turn number for branch cashiers and service officers.',
    },
    {
      id: 'govt',
      name: 'Government Offices',
      tagline: 'RTO, passport verification & municipal citizen services',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: FileText,
      description: 'Official document verification & token appointments.',
    },
    {
      id: 'service_centers',
      name: 'Service Centers',
      tagline: 'Vehicle maintenance, smartphone & appliance repairs',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: Wrench,
      description: 'Intake and pick-up turn tracking for authorized service points.',
    },
    {
      id: 'beauty_parlours',
      name: 'Beauty Parlours & Spas',
      tagline: 'Skin care, bridal makeover & luxury spa turns',
      badge: 'Coming Soon',
      isAvailable: false,
      icon: Sparkles,
      description: 'Dedicated appointment queues for certified beauticians.',
    },
  ];

  const handleCategoryClick = (cat: CategoryItem) => {
    if (cat.isAvailable) {
      onSelectCategory(cat.id);
    } else {
      setComingSoonToast(`${cat.name} queue management is coming soon!`);
      setTimeout(() => setComingSoonToast(null), 3000);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-3xl border relative overflow-hidden transition ${
          isDarkMode
            ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
            : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
        }`}
      >
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 mb-2.5 border border-blue-200 dark:border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Queue Network</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-1 text-[#0F172A] dark:text-[#F8FAFC]">
            Choose a Category
          </h1>

          <p className="text-xs text-[#334155] dark:text-[#94A3B8] leading-relaxed mb-3.5 font-medium">
            Select a service category below to view live locations, check queue times, and take your turn pass.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#1E293B] dark:text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Real-Time Turns
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Pay at Venue
            </span>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
      </div>

      {/* Toast Notification */}
      {comingSoonToast && (
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-2 transition">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{comingSoonToast}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#94A3B8] px-1">
          <span>Service Categories</span>
          <span className="text-[#475569] dark:text-slate-400 font-semibold">Tap to explore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const IconComponent = cat.icon;

            if (cat.isAvailable) {
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`p-4 rounded-2xl border text-left transition relative group active:scale-[0.99] cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#131D31] border-blue-600/50 hover:border-blue-500 hover:bg-[#16233d] shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                      : 'bg-white border-blue-600/40 hover:border-blue-600 hover:shadow-md shadow-[0_2px_10px_rgba(15,23,42,0.06)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-900/25">
                      {cat.id === 'salons' ? (
                        <BrandLogo size={24} className="brightness-0 invert opacity-90" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      Available
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                        {cat.name}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-medium mt-0.5 mb-2">
                      {cat.tagline}
                    </p>

                    {cat.liveCount && (
                      <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{cat.liveCount}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            }

            // Disabled "Coming Soon" Category Card
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`p-4 rounded-2xl border text-left transition relative cursor-not-allowed opacity-80 ${
                  isDarkMode
                    ? 'bg-[#101828]/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50/90 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60">
                    <Lock className="w-2.5 h-2.5" />
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#1E293B] dark:text-slate-300">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#475569] dark:text-slate-400 font-medium mt-0.5">
                    {cat.tagline}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
