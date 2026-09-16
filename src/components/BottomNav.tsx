import React from 'react';
import { useAppStore } from '../store';
import { Home, Ticket, MoreHorizontal, LayoutDashboard, Users, History } from 'lucide-react';

interface BottomNavProps {
  isCustomerMoreOpen?: boolean;
  onToggleCustomerMore?: () => void;
  onCloseCustomerMore?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  isCustomerMoreOpen = false,
  onToggleCustomerMore,
  onCloseCustomerMore,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    activeCustomerToken, 
    isDarkMode, 
    currentRole,
    selectedCategory,
    setSelectedCategory,
    businessSalonId,
    queues,
  } = useAppStore();

  // Single-line label requirement:
  // "Single-line label when token exists: My Token (B-12)"
  const hasToken = activeCustomerToken && (activeCustomerToken.status === 'waiting' || activeCustomerToken.status === 'serving');
  const tokenLabel = hasToken ? `My Token (${activeCustomerToken.tokenNumber})` : 'My Token';

  const currentSalonQueue = queues[businessSalonId] || [];
  const waitingCount = currentSalonQueue.filter((t) => t.status === 'waiting').length;

  const isMoreActive = currentRole === 'customer' ? isCustomerMoreOpen : activeTab === 'more';
  const isHomeActive = currentRole === 'customer' ? (!isCustomerMoreOpen && activeTab === 'home') : activeTab === 'home';
  const isTokenActive = currentRole === 'customer' ? (!isCustomerMoreOpen && activeTab === 'token') : activeTab === 'token';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-4 pt-1 pointer-events-none">
      <nav
        aria-label="Bottom Navigation"
        className={`max-w-md mx-auto pointer-events-auto rounded-3xl backdrop-blur-md border px-2 sm:px-3 py-2 flex items-center justify-around transition-colors duration-150 ${
          isDarkMode
            ? 'bg-[#0B1120]/95 border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] text-[#94A3B8]'
            : 'bg-white/95 border-slate-200/90 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] text-[#334155]'
        }`}
      >
        {currentRole === 'business' ? (
          <>
            {/* Business: Dashboard Tab */}
            <button
              type="button"
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('home')}
              className={`flex-1 py-1.5 px-1.5 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 active:scale-95 ${
                activeTab === 'home'
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap font-bold">Dashboard</span>
            </button>

            {/* Business: Live Queue Tab */}
            <button
              type="button"
              id="nav-tab-live-queue"
              onClick={() => setActiveTab('live_queue')}
              className={`flex-1 py-1.5 px-1.5 min-h-[44px] rounded-2xl flex flex-col items-center justify-center relative transition-colors duration-150 active:scale-95 ${
                activeTab === 'live_queue'
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <div className="relative">
                <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'live_queue' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {waitingCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {waitingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap font-bold">Live Queue</span>
            </button>

            {/* Business: History Tab */}
            <button
              type="button"
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-1.5 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 active:scale-95 ${
                activeTab === 'history'
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <History className={`w-5 h-5 mb-0.5 ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap font-bold">History</span>
            </button>

            {/* Business: More Tab */}
            <button
              type="button"
              id="nav-tab-more"
              onClick={() => setActiveTab('more')}
              className={`flex-1 py-1.5 px-1.5 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 active:scale-95 ${
                activeTab === 'more'
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <MoreHorizontal className={`w-5 h-5 mb-0.5 ${activeTab === 'more' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap font-bold">More</span>
            </button>
          </>
        ) : (
          <>
            {/* Customer: Home Tab */}
            <button
              type="button"
              id="nav-tab-home"
              onClick={() => {
                onCloseCustomerMore?.();
                if (activeTab === 'home' && selectedCategory !== null) {
                  setSelectedCategory(null);
                } else {
                  setActiveTab('home');
                }
              }}
              className={`flex-1 py-1.5 px-2 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 active:scale-95 ${
                isHomeActive
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Home className={`w-5 h-5 mb-0.5 ${isHomeActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="text-[11px] tracking-tight whitespace-nowrap font-bold">Home</span>
            </button>

            {/* Customer: My Token Tab with Single-line Token Number */}
            <button
              type="button"
              id="nav-tab-token"
              onClick={() => {
                onCloseCustomerMore?.();
                setActiveTab('token');
              }}
              className={`flex-1 py-1.5 px-2 min-h-[44px] rounded-2xl flex flex-col items-center justify-center relative transition-colors duration-150 active:scale-95 ${
                isTokenActive
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : hasToken
                  ? 'text-amber-800 dark:text-amber-300 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <div className="relative">
                <Ticket
                  className={`w-5 h-5 mb-0.5 ${
                    isTokenActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : hasToken
                      ? 'text-amber-800 dark:text-amber-300'
                      : ''
                  }`}
                />
                {hasToken && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                )}
              </div>
              {/* Single-line label when token exists */}
              <span className="text-[11px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] font-bold">
                {tokenLabel}
              </span>
            </button>

            {/* Customer: More Tab (Opens bottom drawer without navigating to a new page) */}
            <button
              type="button"
              id="nav-tab-more"
              onClick={() => {
                if (onToggleCustomerMore) {
                  onToggleCustomerMore();
                } else {
                  setActiveTab('more');
                }
              }}
              className={`flex-1 py-1.5 px-2 min-h-[44px] rounded-2xl flex flex-col items-center justify-center transition-colors duration-150 active:scale-95 ${
                isMoreActive
                  ? 'text-blue-600 dark:text-blue-400 font-black'
                  : 'text-[#334155] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <MoreHorizontal className={`w-5 h-5 mb-0.5 ${isMoreActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="text-[11px] tracking-tight whitespace-nowrap font-bold">More</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};
