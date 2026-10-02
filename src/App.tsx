/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAppStore } from './store';
import { Header } from './components/Header';
import { SalonCard } from './components/SalonCard';
import RetroTicket from './components/RetroTicket';
import { ServiceSelectModal } from './components/ServiceSelectModal';
import { BusinessDashboard } from './components/BusinessDashboard';
import { FutureBusinessDashboard } from './components/FutureBusinessDashboard';
import { BottomNav } from './components/BottomNav';
import { MoreScreen } from './components/MoreScreen';
import { CustomerMoreDrawer } from './components/CustomerMoreDrawer';
import { LoginScreen } from './components/LoginScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { TurnAlertToast } from './components/TurnAlertToast';
import { BrandLogo } from './components/BrandLogo';
import { useTurnNotificationWatcher } from './hooks/useTurnNotificationWatcher';
import { Salon } from './types';
import { 
  Search, 
  MapPin, 
  Ticket, 
  Sparkles, 
  Scissors, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

export default function App() {
  const {
    isAuthenticated,
    isDarkMode,
    currentRole,
    currentBusinessType,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    salons,
    queues,
    activeCustomerToken,
  } = useAppStore();

  const [selectedSalonForModal, setSelectedSalonForModal] = useState<Salon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const shouldReduceMotion = useReducedMotion();

  // Watch real-time turn notifications (sound, lockscreen/system notification, in-app toast)
  useTurnNotificationWatcher();

  // Track the most recent primary tab so closing the More bottom sheet returns cleanly
  const [lastNonMoreTab, setLastNonMoreTab] = useState<'home' | 'token' | 'live_queue' | 'history'>('home');
  const [isCustomerMoreOpen, setIsCustomerMoreOpen] = useState(false);

  useEffect(() => {
    if (activeTab !== 'more') {
      setLastNonMoreTab(activeTab);
    } else if (currentRole === 'customer') {
      // Customer More is a drawer overlay, not a new page! Keep tab on home or token.
      setIsCustomerMoreOpen(true);
      setActiveTab(lastNonMoreTab === 'token' ? 'token' : 'home');
    }
  }, [activeTab, currentRole, lastNonMoreTab, setActiveTab]);

  // Synchronize theme with HTML document element and body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#0B1120] text-[#F8FAFC] antialiased selection:bg-blue-600 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#F1F5F9] text-[#0F172A] antialiased selection:bg-blue-600 selection:text-white';
    }
  }, [isDarkMode]);

  const cities = ['All', 'Bengaluru', 'New Delhi', 'Mumbai'];

  // Filter salons based on city and search query
  const filteredSalons = salons.filter((salon) => {
    const matchesCity = selectedCity === 'All' || salon.city.toLowerCase() === selectedCity.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !query ||
      salon.name.toLowerCase().includes(query) ||
      salon.locality.toLowerCase().includes(query) ||
      salon.services.some((s) => s.name.toLowerCase().includes(query));
    return matchesCity && matchesQuery;
  });

  return (
    <AnimatePresence mode="wait">
      {!isAuthenticated ? (
        /* Login Details with fast, natural transition */
        <motion.div
          key="unauth-login"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="min-h-screen"
        >
          <LoginScreen />
        </motion.div>
      ) : (
        /* Main Authenticated View with smooth, lightweight fade */
        <motion.div
          key="auth-app-root"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className={`min-h-screen transition-colors duration-150 ${
            isDarkMode ? 'bg-[#0B1120] text-[#F8FAFC]' : 'bg-[#F1F5F9] text-[#0F172A]'
          }`}
        >
          {/* Real-time In-App Turn Alert Toast Banner */}
          <TurnAlertToast />

          {/* Top Navigation Header */}
          <Header />

          {/* Main Container */}
          <main className="max-w-2xl mx-auto w-full min-h-[calc(100vh-65px)] pb-24">
            {/* VIEW 1: BUSINESS OWNER PORTAL */}
            {currentRole === 'business' ? (
              <>
                {currentBusinessType === 'salon' ? (
                  <BusinessDashboard />
                ) : (
                  <FutureBusinessDashboard businessType={currentBusinessType} />
                )}
                <BottomNav />
              </>
            ) : (
              /* VIEW 2: CUSTOMER APP VIEWS - Home stays visually stationary underneath drawer */
              <>
                <AnimatePresence mode="wait" initial={false}>
                  {/* TAB: HOME (Categories or Salon Discovery) */}
                  {activeTab === 'home' && (
                    <motion.div
                      key="tab-home-container"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                    >
                      <AnimatePresence initial={false}>
                        {!selectedCategory ? (
                          /* CATEGORY SCREEN */
                          <motion.div
                            key="category-screen-view"
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                          >
                            <CategoryScreen onSelectCategory={(catId) => setSelectedCategory(catId)} />
                          </motion.div>
                        ) : (
                          /* CHOOSE YOUR SALON VIEW (Fluid forward navigation) */
                          <motion.div
                            key="salon-discovery-view"
                            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                            className="px-4 py-4 space-y-4"
                          >
                            {/* Category Breadcrumb / Back Button (Natural reverse transition) */}
                            <div className="flex items-center justify-between pb-0.5">
                              <button
                                type="button"
                                onClick={() => setSelectedCategory(null)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#131D31] hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shadow-2xs cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Choose a Category</span>
                              </button>
                              <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                                Selected: <strong className="text-blue-600 dark:text-blue-400 font-black">Salons</strong>
                              </span>
                            </div>

                            {/* Hero Banner with tailored Light / Dark Surface */}
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
                                  <span>Live Salon Queue</span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-1.5 text-[#0F172A] dark:text-[#F8FAFC]">
                                  Choose Your Salon
                                </h1>
                                <p className="text-xs text-[#334155] dark:text-[#94A3B8] leading-relaxed mb-3.5 font-medium">
                                  Skip crowded physical waiting rooms at top barber shops &amp; salons in India. Check wait times and take a turn pass.
                                </p>
                                <div className="flex items-center gap-4 text-[11px] text-[#1E293B] dark:text-slate-300 font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Live Turn Counter
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Pay at Partner Location
                                  </span>
                                </div>
                              </div>
                              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
                            </div>

                            {/* Search & City Filter Bar */}
                            <div className="space-y-2.5">
                              {/* Search Input */}
                              <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search salons, beard trim, skin fade..."
                                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isDarkMode
                                      ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] placeholder:text-slate-500 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                                      : 'bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.04)] font-medium'
                                  }`}
                                />
                                {searchQuery && (
                                  <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3.5 top-3 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              {/* City Filter Pills */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                <span className="text-[11px] font-extrabold text-[#0F172A] dark:text-[#94A3B8] px-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  City:
                                </span>
                                {cities.map((city) => (
                                  <button
                                    key={city}
                                    type="button"
                                    onClick={() => setSelectedCity(city)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                                      selectedCity === city
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : isDarkMode
                                        ? 'bg-[#131D31] border border-slate-700/60 text-[#94A3B8] hover:text-[#F8FAFC]'
                                        : 'bg-white border border-slate-300 text-[#334155] hover:text-[#0F172A] hover:border-slate-400 shadow-2xs'
                                    }`}
                                  >
                                    {city}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Salon List with Card Entrance Animation */}
                            <div className="space-y-4 pt-1">
                              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#94A3B8] px-1">
                                <span>Available Salons ({filteredSalons.length})</span>
                                <span className="text-[#475569] dark:text-slate-400 font-semibold">Select salon to view services</span>
                              </div>

                              {filteredSalons.length === 0 ? (
                                <div
                                  className={`p-10 text-center rounded-3xl border transition ${
                                    isDarkMode
                                      ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                                      : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
                                  }`}
                                >
                                  <BrandLogo className="w-10 h-10 opacity-30 mx-auto mb-2 grayscale mix-blend-luminosity" />
                                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">No Salons Found</h3>
                                  <p className="text-xs text-[#334155] dark:text-[#94A3B8] mb-3 font-medium">
                                    Try clearing your search query or selecting &quot;All&quot; cities.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery('');
                                      setSelectedCity('All');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                                  >
                                    Reset Filters
                                  </button>
                                </div>
                              ) : (
                                filteredSalons.map((salon) => (
                                  <SalonCard
                                    key={salon.id}
                                    salon={salon}
                                    queue={queues[salon.id] || []}
                                    onSelectSalon={(s) => setSelectedSalonForModal(s)}
                                    isDarkMode={isDarkMode}
                                  />
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* TAB: MY TOKEN (Fast, clean fade + subtle 6px shift) */}
                  {activeTab === 'token' && (
                    <motion.div
                      key="tab-token-container"
                      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                      className="px-4 py-6"
                    >
                      {activeCustomerToken ? (
                        <RetroTicket
                          token={activeCustomerToken}
                          onExploreSalons={() => {
                            setSelectedCategory('salons');
                            setActiveTab('home');
                          }}
                        />
                      ) : (
                        /* EMPTY STATE: NO ACTIVE TOKEN */
                        <div
                          className={`max-w-md mx-auto p-8 rounded-3xl border text-center transition ${
                            isDarkMode
                              ? 'bg-[#131D31] border-slate-700/60 text-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                              : 'bg-white border-slate-200/90 text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
                          }`}
                        >
                          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-500/30 shadow-xs">
                            <Ticket className="w-8 h-8" />
                          </div>
                          <h2 className="text-lg font-extrabold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                            No Active Token
                          </h2>
                          <p className="text-xs text-[#334155] dark:text-[#94A3B8] leading-relaxed mb-6 font-medium">
                            You haven&apos;t joined any salon queue yet. Explore nearby salons, browse service catalogs, and take your turn pass.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory('salons');
                              setActiveTab('home');
                            }}
                            className="w-full py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                          >
                            <span>Explore Salons &amp; Take Turn</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Liquid Glass Bottom Navigation */}
                <BottomNav 
                  isCustomerMoreOpen={isCustomerMoreOpen}
                  onToggleCustomerMore={() => setIsCustomerMoreOpen((prev) => !prev)}
                  onCloseCustomerMore={() => setIsCustomerMoreOpen(false)}
                />

                {/* CUSTOMER: BOTTOM DRAWER QUICK-SETTINGS PANEL (Home screen remains visible behind) */}
                <CustomerMoreDrawer
                  isOpen={isCustomerMoreOpen}
                  onClose={() => setIsCustomerMoreOpen(false)}
                />
              </>
            )}
          </main>

          {/* BUSINESS OWNER: SETTINGS BOTTOM SHEET */}
          <AnimatePresence>
            {currentRole === 'business' && activeTab === 'more' && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end">
                {/* Background Dim Backdrop */}
                <motion.div
                  key="more-sheet-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                  onClick={() => setActiveTab(lastNonMoreTab)}
                  className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
                  aria-hidden="true"
                />

                {/* Business Settings Bottom Sheet */}
                <motion.div
                  key="business-more-bottom-sheet"
                  initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  drag={shouldReduceMotion ? false : 'y'}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.25 }}
                  onDragEnd={(_e, info) => {
                    if (info.offset.y > 65 || info.velocity.y > 220) {
                      setActiveTab(lastNonMoreTab);
                    }
                  }}
                  className={`relative z-10 w-full max-w-lg mx-auto max-h-[76vh] flex flex-col rounded-t-[28px] border-t shadow-[0_-8px_32px_rgba(0,0,0,0.35)] overflow-hidden ${
                    isDarkMode
                      ? 'bg-[#0F172A] border-slate-700/80 text-[#F8FAFC]'
                      : 'bg-white border-slate-200 text-[#0F172A]'
                  }`}
                >
                  <div className="w-full pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition" />
                  </div>

                  <div className="flex-1 overflow-y-auto overscroll-contain">
                    <MoreScreen onClose={() => setActiveTab(lastNonMoreTab)} />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* STRICT FLOW: Service Select & Order Confirmation Modal */}
          {selectedSalonForModal && (
            <ServiceSelectModal
              salon={selectedSalonForModal}
              onClose={() => setSelectedSalonForModal(null)}
              onViewExistingToken={() => {
                setSelectedSalonForModal(null);
                setActiveTab('token');
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
