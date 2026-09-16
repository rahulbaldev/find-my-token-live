import React, { useState } from 'react';
import { Service } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  Scissors, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

export interface ServiceManagerProps {
  services: Service[];
  onChange: (services: Service[]) => void;
  isDarkMode: boolean;
}

export const COMMON_SALON_SERVICES_PRESETS = [
  { name: 'Haircut', category: 'Hair' as const, durationMins: 30, price: 100, description: 'Classic precision haircut & styling' },
  { name: 'Beard', category: 'Beard' as const, durationMins: 15, price: 40, description: 'Beard trim, shape & grooming' },
  { name: 'Haircut + Beard', category: 'Hair' as const, durationMins: 45, price: 140, description: 'Complete haircut + beard grooming combo' },
  { name: 'Facial', category: 'Spa' as const, durationMins: 45, price: 200, description: 'Deep cleansing & rejuvenation facial' },
  { name: 'Head Massage', category: 'Spa' as const, durationMins: 20, price: 120, description: 'Stress-relief oil head massage' },
  { name: 'Hair Color / Dye', category: 'Color' as const, durationMins: 40, price: 250, description: 'Ammonia-free hair coloring & styling' },
  { name: 'Shave & Detan', category: 'Beard' as const, durationMins: 25, price: 160, description: 'Hot towel razor shave + detan pack' },
  { name: 'Hair Spa', category: 'Spa' as const, durationMins: 45, price: 350, description: 'Intense hair nourishment & conditioning' },
];

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  onChange,
  isDarkMode,
}) => {
  // Local drafts for in-progress typing so inputs never jump to 0 or 5 while clearing or typing
  const [drafts, setDrafts] = useState<Record<string, { price: string; durationMins: string; name: string }>>({});

  // Custom Service Form State
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState<string>('150');
  const [customTime, setCustomTime] = useState<string>('30');
  const [customCategory, setCustomCategory] = useState<'Hair' | 'Beard' | 'Spa' | 'Color'>('Hair');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to get active draft or saved service value
  const getDraft = (service: Service) => {
    return drafts[service.id] || {
      name: service.name,
      price: String(service.price),
      durationMins: String(service.durationMins),
    };
  };

  // Handle service name editing
  const handleNameChange = (id: string, newName: string) => {
    setDrafts((prev) => {
      const current = prev[id] || {
        name: services.find((s) => s.id === id)?.name || '',
        price: String(services.find((s) => s.id === id)?.price || 100),
        durationMins: String(services.find((s) => s.id === id)?.durationMins || 15),
      };
      return { ...prev, [id]: { ...current, name: newName } };
    });

    // Save if valid
    if (newName.trim()) {
      const updated = services.map((s) => (s.id === id ? { ...s, name: newName } : s));
      onChange(updated);
    }
  };

  // Handle price typing: allow empty string while typing, only save valid non-zero numbers
  const handlePriceChange = (id: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    setDrafts((prev) => {
      const current = prev[id] || {
        name: services.find((s) => s.id === id)?.name || '',
        price: String(services.find((s) => s.id === id)?.price || 100),
        durationMins: String(services.find((s) => s.id === id)?.durationMins || 15),
      };
      return { ...prev, [id]: { ...current, price: cleaned } };
    });

    // Only commit immediately if owner entered a valid positive number
    if (cleaned.length > 0) {
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0) {
        const updated = services.map((s) => (s.id === id ? { ...s, price: num } : s));
        onChange(updated);
      }
    }
  };

  // On Price blur: if left empty or zero, restore previous valid price to prevent corruption
  const handlePriceBlur = (id: string) => {
    const currentService = services.find((s) => s.id === id);
    if (!currentService) return;

    const draft = drafts[id];
    if (!draft || !draft.price) {
      const fallbackPrice = currentService.price > 0 ? currentService.price : 50;
      setDrafts((prev) => ({
        ...prev,
        [id]: {
          name: draft?.name || currentService.name,
          price: String(fallbackPrice),
          durationMins: draft?.durationMins || String(currentService.durationMins),
        },
      }));
      const updated = services.map((s) => (s.id === id ? { ...s, price: fallbackPrice } : s));
      onChange(updated);
      return;
    }

    const num = parseInt(draft.price, 10);
    if (isNaN(num) || num <= 0) {
      const fallbackPrice = currentService.price > 0 ? currentService.price : 50;
      setDrafts((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          price: String(fallbackPrice),
        },
      }));
      const updated = services.map((s) => (s.id === id ? { ...s, price: fallbackPrice } : s));
      onChange(updated);
    } else {
      const updated = services.map((s) => (s.id === id ? { ...s, price: num } : s));
      onChange(updated);
    }
  };

  // Handle duration typing: allow empty string while typing, only save valid numbers >= 5
  const handleDurationChange = (id: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    setDrafts((prev) => {
      const current = prev[id] || {
        name: services.find((s) => s.id === id)?.name || '',
        price: String(services.find((s) => s.id === id)?.price || 100),
        durationMins: String(services.find((s) => s.id === id)?.durationMins || 15),
      };
      return { ...prev, [id]: { ...current, durationMins: cleaned } };
    });

    if (cleaned.length > 0) {
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num >= 5) {
        const updated = services.map((s) => (s.id === id ? { ...s, durationMins: num } : s));
        onChange(updated);
      }
    }
  };

  // On Duration blur: if left empty or < 5, restore previous valid duration
  const handleDurationBlur = (id: string) => {
    const currentService = services.find((s) => s.id === id);
    if (!currentService) return;

    const draft = drafts[id];
    if (!draft || !draft.durationMins) {
      const fallbackTime = currentService.durationMins >= 5 ? currentService.durationMins : 15;
      setDrafts((prev) => ({
        ...prev,
        [id]: {
          name: draft?.name || currentService.name,
          price: draft?.price || String(currentService.price),
          durationMins: String(fallbackTime),
        },
      }));
      const updated = services.map((s) => (s.id === id ? { ...s, durationMins: fallbackTime } : s));
      onChange(updated);
      return;
    }

    const num = parseInt(draft.durationMins, 10);
    if (isNaN(num) || num < 5) {
      const fallbackTime = currentService.durationMins >= 5 ? currentService.durationMins : 15;
      setDrafts((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          durationMins: String(fallbackTime),
        },
      }));
      const updated = services.map((s) => (s.id === id ? { ...s, durationMins: fallbackTime } : s));
      onChange(updated);
    } else {
      const updated = services.map((s) => (s.id === id ? { ...s, durationMins: num } : s));
      onChange(updated);
    }
  };

  // Remove a service completely (Requirement: allow owner to remove a service completely)
  const handleRemoveService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    onChange(updated);
  };

  // Add a common preset service
  const handleAddPreset = (preset: typeof COMMON_SALON_SERVICES_PRESETS[0]) => {
    const exists = services.some((s) => s.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      alert(`"${preset.name}" is already in your service list.`);
      return;
    }

    const newService: Service = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name,
      category: preset.category,
      price: preset.price,
      durationMins: preset.durationMins,
      description: preset.description,
    };

    onChange([...services, newService]);
  };

  // Add custom service with validation
  const handleAddCustomService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Please enter a service name.');
      return;
    }

    const priceNum = parseInt(customPrice, 10);
    const timeNum = parseInt(customTime, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid price (₹) greater than 0.');
      return;
    }
    if (isNaN(timeNum) || timeNum < 5) {
      setErrorMsg('Estimated time must be at least 5 minutes.');
      return;
    }

    const newService: Service = {
      id: `srv-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customName.trim(),
      category: customCategory,
      price: priceNum,
      durationMins: timeNum,
      description: `${customName.trim()} service`,
    };

    onChange([...services, newService]);
    setCustomName('');
    setCustomPrice('150');
    setCustomTime('30');
    setShowAddCustom(false);
    setErrorMsg(null);
  };

  // Check which common presets are not yet added
  const missingPresets = COMMON_SALON_SERVICES_PRESETS.filter(
    (preset) => !services.some((s) => s.name.toLowerCase() === preset.name.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Services List Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Scissors className="w-4 h-4" />
              <span>Configured Services ({services.length})</span>
            </h4>
            <p className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
              Set name, price (₹) and estimated time (min) for each service.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddCustom ? 'Close Form' : 'Add Custom'}</span>
          </button>
        </div>

        {/* Empty state if all services removed */}
        {services.length === 0 && (
          <div className="p-6 text-center border-2 border-dashed rounded-2xl border-slate-300 dark:border-slate-700">
            <BrandLogo className="w-8 h-8 opacity-30 mx-auto mb-2 grayscale" />
            <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">No services configured yet</p>
            <p className="text-xs text-slate-500 mt-1">Use the quick presets below or add a custom service.</p>
          </div>
        )}

        {/* List of active services */}
        <div className="space-y-2.5">
          {services.map((service, index) => {
            const draft = getDraft(service);

            return (
              <div
                key={service.id}
                className={`p-3.5 rounded-2xl border transition ${
                  isDarkMode
                    ? 'bg-[#0B1120]/80 border-slate-700/60 shadow-[0_2px_10px_rgba(0,0,0,0.25)]'
                    : 'bg-white border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => handleNameChange(service.id, e.target.value)}
                      placeholder="Service Name"
                      className={`w-full text-xs sm:text-sm font-black rounded-lg px-2.5 py-1.5 border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-[#131D31] border-slate-700 text-white'
                          : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                    title="Remove this service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price & Duration Inputs */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Price Setting */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#334155] dark:text-[#94A3B8] mb-1">
                      Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={draft.price}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        onBlur={() => handlePriceBlur(service.id)}
                        placeholder="Price"
                        className={`w-full pl-6 pr-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-[#131D31] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Estimated Time Setting */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#334155] dark:text-[#94A3B8] mb-1">
                      Estimated Time (mins)
                    </label>
                    <div className="relative">
                      <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-blue-600 dark:text-blue-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={draft.durationMins}
                        onChange={(e) => handleDurationChange(service.id, e.target.value)}
                        onBlur={() => handleDurationBlur(service.id)}
                        placeholder="Mins"
                        className={`w-full pl-7 pr-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-[#131D31] border-slate-700 text-white'
                            : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Common Services */}
      {missingPresets.length > 0 && (
        <div
          className={`p-3.5 rounded-2xl border space-y-2 ${
            isDarkMode ? 'bg-[#0B1120]/50 border-slate-800' : 'bg-slate-50 border-slate-200/90'
          }`}
        >
          <span className="text-[11px] font-bold text-[#334155] dark:text-[#94A3B8] block">
            + Quick Add Common Services:
          </span>
          <div className="flex flex-wrap gap-2">
            {missingPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border border-blue-300/80 dark:border-blue-700/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition"
              >
                <Plus className="w-3 h-3" />
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-75 font-mono">₹{preset.price} • {preset.durationMins}m</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Service Form */}
      {showAddCustom && (
        <form
          onSubmit={handleAddCustomService}
          className={`p-4 rounded-2xl border space-y-3 animate-in fade-in zoom-in-95 ${
            isDarkMode
              ? 'bg-[#131D31] border-blue-600/50 shadow-lg'
              : 'bg-blue-50/40 border-blue-200 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add Custom Service</span>
            </h5>
            <span className="text-[10px] text-slate-500 font-semibold">Custom Pricing & Time</span>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#0F172A] dark:text-slate-200 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Keratin Hair Treatment, Detan Pack, Kids Haircut..."
              className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white' : 'bg-white border-slate-300 text-[#0F172A]'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#334155] dark:text-[#94A3B8] mb-1">
                Price (₹) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="150"
                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white' : 'bg-white border-slate-300 text-[#0F172A]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#334155] dark:text-[#94A3B8] mb-1">
                Time (mins) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="30"
                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white' : 'bg-white border-slate-300 text-[#0F172A]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#334155] dark:text-[#94A3B8] mb-1">
                Category
              </label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className={`w-full px-2 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white' : 'bg-white border-slate-300 text-[#0F172A]'
                }`}
              >
                <option value="Hair">Hair</option>
                <option value="Beard">Beard</option>
                <option value="Spa">Spa</option>
                <option value="Color">Color</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddCustom(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
            >
              + Save Service
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
