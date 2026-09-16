import React from 'react';
import { useAppStore } from '../store';
import { BrandLogo } from './BrandLogo';
import { Scissors, Ticket, Store, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    isDarkMode, 
    currentRole, 
    currentUser,
    activeCustomerToken,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
  } = useAppStore();

  const hasActiveToken = activeCustomerToken && (activeCustomerToken.status === 'waiting' || activeCustomerToken.status === 'serving');

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#0B1120]/90 border-slate-800/80 text-[#F8FAFC]'
          : 'bg-white/95 border-slate-200/90 text-[#0F172A] shadow-[0_2px_12px_rgba(15,23,42,0.05)]'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Tagline */}
          <div 
            onClick={() => {
              if (currentRole === 'customer') {
                setActiveTab('home');
                setSelectedCategory(null);
              }
            }}
            className="cursor-pointer select-none flex items-center gap-2.5"
          >
            <BrandLogo size={40} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                  Find My Token
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  India
                </span>
              </div>
              <p className="text-[10px] text-[#334155] dark:text-[#94A3B8] font-bold">
                Your Turn. Without the Wait.
              </p>
            </div>
          </div>

          {/* Right Header Status Chip (No Standalone Role/Theme Toggles) */}
          <div className="flex items-center gap-2">
            {currentRole === 'business' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 shadow-2xs">
                <Store className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                <span>Partner Portal</span>
              </div>
            ) : hasActiveToken ? (
              <button
                type="button"
                onClick={() => setActiveTab('token')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/50 shadow-xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition active:scale-95"
              >
                <Ticket className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-mono font-bold">#{activeCustomerToken.tokenNumber}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              </button>
            ) : currentUser ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100/90 dark:bg-[#131D31] text-[#0F172A] dark:text-slate-200 border border-slate-300/80 dark:border-slate-700/60 shadow-2xs">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

