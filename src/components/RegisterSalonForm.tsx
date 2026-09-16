import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { Salon, Service, BusinessType, BUSINESS_TYPES_CONFIG } from '../types';
import { 
  Store, 
  MapPin, 
  Clock, 
  Users, 
  Image as ImageIcon, 
  Check, 
  Sparkles,
  ArrowLeft,
  Upload,
  X,
  Camera,
  Scissors,
  Stethoscope,
  Utensils,
  Wrench,
  Landmark
} from 'lucide-react';
import { checkSalonOpenStatus } from '../utils/salonSchedule';
import { ServiceManager, COMMON_SALON_SERVICES_PRESETS } from './ServiceManager';
import { BrandLogo } from './BrandLogo';

interface RegisterSalonFormProps {
  existingSalon?: Salon;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RegisterSalonForm: React.FC<RegisterSalonFormProps> = ({
  existingSalon,
  onClose,
  onSuccess,
}) => {
  const { registerNewSalon, updateSalonDetails, isDarkMode, setBusinessSalonId, setCurrentRole, setCurrentBusinessType } = useAppStore();

  const [businessType, setBusinessType] = useState<BusinessType>(existingSalon?.businessType || 'salon');
  const [name, setName] = useState(existingSalon?.name || '');
  const [ownerName, setOwnerName] = useState(existingSalon?.ownerName || '');
  const [phone, setPhone] = useState(existingSalon?.registeredPhone || existingSalon?.phone || '+91 ');

  // Salon Images & Owner Photo Uploads (via device gallery/files)
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    existingSalon?.images && existingSalon.images.length > 0
      ? existingSalon.images
      : existingSalon?.image
      ? [existingSalon.image]
      : ['https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80']
  );
  const [image, setImage] = useState<string>(
    existingSalon?.image || (uploadedImages[0] || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80')
  );
  const [ownerPhoto, setOwnerPhoto] = useState<string>(
    existingSalon?.ownerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  );

  // File input references
  const salonFileInputRef = useRef<HTMLInputElement>(null);
  const ownerFileInputRef = useRef<HTMLInputElement>(null);

  // Services + Estimated Time state
  const [services, setServices] = useState<Service[]>(
    existingSalon?.services && existingSalon.services.length > 0
      ? existingSalon.services
      : [
          { id: 'srv-1', name: 'Haircut', category: 'Hair', durationMins: 30, price: 100, description: 'Classic precision haircut & styling' },
          { id: 'srv-2', name: 'Beard', category: 'Beard', durationMins: 15, price: 40, description: 'Beard trim, shape & grooming' },
          { id: 'srv-3', name: 'Haircut + Beard', category: 'Hair', durationMins: 45, price: 140, description: 'Complete haircut + beard grooming combo' },
          { id: 'srv-4', name: 'Facial', category: 'Spa', durationMins: 45, price: 200, description: 'Refreshing facial cleansing & treatment' },
        ]
  );

  const [barbersCount, setBarbersCount] = useState(existingSalon?.barbers.length || 4);
  const [seatsCount, setSeatsCount] = useState(existingSalon?.seatsCount || 4);
  const [locality, setLocality] = useState(existingSalon?.locality || '');
  const [address, setAddress] = useState(existingSalon?.address || '');
  const [city, setCity] = useState(existingSalon?.city || 'Bengaluru');
  const [openingTime, setOpeningTime] = useState(existingSalon?.openingTime || '08:00 AM');
  const [closingTime, setClosingTime] = useState(existingSalon?.closingTime || '09:00 PM');
  const [isManualOverride, setIsManualOverride] = useState(Boolean(existingSalon?.isManualOverride));
  const [manualOpenStatus, setManualOpenStatus] = useState(existingSalon?.manualOpenStatus ?? true);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Handle Salon Image Uploads from device gallery/files
  const handleSalonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload valid image files (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setUploadedImages((prev) => {
            const next = [...prev, dataUrl];
            if (next.length === 1 || !image) {
              setImage(dataUrl);
            }
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Remove uploaded salon image
  const handleRemoveSalonImage = (indexToRemove: number) => {
    if (uploadedImages.length <= 1) {
      alert('Please keep at least one salon photo.');
      return;
    }
    const filtered = uploadedImages.filter((_, idx) => idx !== indexToRemove);
    setUploadedImages(filtered);
    if (image === uploadedImages[indexToRemove]) {
      setImage(filtered[0]);
    }
  };

  // Set primary cover image
  const handleSetCoverImage = (imgUrl: string) => {
    setImage(imgUrl);
    setUploadedImages((prev) => [imgUrl, ...prev.filter((u) => u !== imgUrl)]);
  };

  // Handle Owner Photo Upload from device gallery/files
  const handleOwnerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setOwnerPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Temporary mock salon to preview schedule status in real time
  const previewSalon: Salon = {
    id: existingSalon?.id || 'preview',
    name: name || 'Your Salon',
    tagline: 'Grooming studio',
    locality: locality || 'Locality',
    city,
    address,
    rating: 5.0,
    totalReviews: 1,
    isOpen: true,
    openingHours: `${openingTime} – ${closingTime}`,
    openingTime,
    closingTime,
    isManualOverride,
    manualOpenStatus,
    activeBarbersCount: barbersCount,
    barbers: [],
    services,
    image,
    phone,
  };

  const scheduleStatus = checkSalonOpenStatus(previewSalon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !ownerName.trim()) {
      alert('Please fill in both Business Name and Owner Name.');
      return;
    }

    if (businessType === 'salon' && services.length === 0) {
      alert('Please configure at least one service with estimated time for your salon.');
      return;
    }

    // Default service for non-salon categories if none configured
    const effectiveServices = services.length > 0 ? services : [
      {
        id: `srv-${Date.now()}-1`,
        name: businessType === 'clinic' ? 'Doctor OPD Consultation' :
              businessType === 'restaurant' ? 'Dine-In Table Turn' :
              businessType === 'service_center' ? 'General Vehicle Inspection' : 'Civic Desk Token Pass',
        category: 'General',
        durationMins: 20,
        price: 0,
        description: 'Standard token service',
      }
    ];

    const primaryImage = image || uploadedImages[0] || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80';

    if (existingSalon) {
      updateSalonDetails(existingSalon.id, {
        name,
        ownerName,
        registeredPhone: phone,
        phone,
        businessType: existingSalon.businessType || 'salon',
        image: primaryImage,
        images: uploadedImages.length > 0 ? uploadedImages : [primaryImage],
        ownerPhoto,
        seatsCount,
        locality,
        address,
        city,
        openingTime,
        closingTime,
        openingHours: `${openingTime} – ${closingTime}`,
        isManualOverride,
        manualOpenStatus,
        services: existingSalon.services, // Preserved: Services managed ONLY in Services & Estimated Times
      });
      setSubmittedMessage('Salon profile and schedule updated successfully!');
    } else {
      const newSalonId = registerNewSalon({
        name,
        ownerName,
        phone,
        registeredPhone: phone,
        businessType,
        image: primaryImage,
        images: uploadedImages.length > 0 ? uploadedImages : [primaryImage],
        ownerPhoto,
        barbersCount,
        seatsCount,
        locality,
        address,
        city,
        openingTime,
        closingTime,
        services: effectiveServices,
      });

      setBusinessSalonId(newSalonId);
      setCurrentRole('business');
      setCurrentBusinessType(businessType);
      setSubmittedMessage(`Business registered successfully! Opening ${BUSINESS_TYPES_CONFIG[businessType].label} Dashboard...`);
    }

    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Requirement 1: Single proper back navigation control (No duplicate upper back arrow) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="w-9 h-9 rounded-full backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 shadow-xs text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 active:scale-95 transition-transform flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">
            {existingSalon ? 'Edit Salon Profile & Schedule' : 'Register Your Business on Find My Token'}
          </h2>
          <p className="text-xs text-[#334155] dark:text-[#94A3B8] font-semibold">
            {existingSalon
              ? 'Update shop address, gallery photos, operating hours & chairs'
              : 'Select business category, setup queue profile, and configure wait times'}
          </p>
        </div>
      </div>

      {submittedMessage && (
        <div className="p-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{submittedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* SECTION 0: SELECT BUSINESS TYPE - Visible ONLY during new business registration */}
        {!existingSalon && (
        <div
          className={`p-5 rounded-3xl border space-y-3.5 transition ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>Select Business Type</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              5 Categories
            </span>
          </div>

          <p className="text-xs text-[#334155] dark:text-[#94A3B8] leading-relaxed">
            Choose your establishment type. When you log in with your registered mobile number, the system will open your category-specific dashboard.
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {Object.values(BUSINESS_TYPES_CONFIG).map((typeOpt) => {
              const isSelected = businessType === typeOpt.id;
              const isAvailable = typeOpt.status === 'available';

              return (
                <button
                  key={typeOpt.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    if (isAvailable) {
                      setBusinessType(typeOpt.id);
                    }
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                      : !isAvailable
                      ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40'
                      : isDarkMode
                      ? 'border-slate-700/70 bg-[#0B1120]/60 hover:bg-slate-800/60 cursor-pointer'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                          : !isAvailable
                          ? 'bg-slate-200/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {typeOpt.id === 'salon' && <BrandLogo size={20} />}
                      {typeOpt.id === 'clinic' && <Stethoscope className="w-5 h-5" />}
                      {typeOpt.id === 'restaurant' && <Utensils className="w-5 h-5" />}
                      {typeOpt.id === 'service_center' && <Wrench className="w-5 h-5" />}
                      {typeOpt.id === 'government_office' && <Landmark className="w-5 h-5" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-[#0F172A] dark:text-[#F8FAFC]">
                          {typeOpt.label}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/40'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-400 border-slate-300 dark:border-slate-700/40'
                          }`}
                        >
                          {typeOpt.statusBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                        {typeOpt.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : !isAvailable
                          ? 'border-slate-300/60 dark:border-slate-700/60 bg-transparent'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {businessType !== 'salon' && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong>{BUSINESS_TYPES_CONFIG[businessType].label} account</strong> will be saved with this business profile.
                When you log in with your registered phone number, you will automatically be directed to the {BUSINESS_TYPES_CONFIG[businessType].label} Dashboard.
              </div>
            </div>
          )}
        </div>
        )}

        {/* SECTION 1: BUSINESS ESSENTIALS */}
        <div
          className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Store className="w-4 h-4" />
            <span>{BUSINESS_TYPES_CONFIG[businessType].label} &amp; Owner Profile</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                {businessType === 'salon' ? 'Salon / Business Name *' : `${BUSINESS_TYPES_CONFIG[businessType].label} Name *`}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Fade & Shave Studio"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Store Owner Name"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Registered Business Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12890"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: REQUIREMENT 2: SALON IMAGE + OWNER PHOTO UPLOAD FROM DEVICE GALLERY/FILES */}
        <div
          className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" />
            <span>Upload Salon Images & Owner Photo</span>
          </h3>

          <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
            Upload authentic photos from your device gallery or file manager.
          </p>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={salonFileInputRef}
            accept="image/*"
            multiple
            onChange={handleSalonImageUpload}
            className="hidden"
          />
          <input
            type="file"
            ref={ownerFileInputRef}
            accept="image/*"
            onChange={handleOwnerPhotoUpload}
            className="hidden"
          />

          {/* Salon Images Upload & Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200">
                Salon / Business Images ({uploadedImages.length})
              </label>
              <button
                type="button"
                onClick={() => salonFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition active:scale-95 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Gallery</span>
              </button>
            </div>

            {/* Uploaded Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {uploadedImages.map((imgUrl, index) => {
                const isCover = imgUrl === image;
                return (
                  <div
                    key={index}
                    className={`relative rounded-2xl overflow-hidden border-2 transition group ${
                      isCover
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Salon photo ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-24 object-cover"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      {isCover ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                          Cover Photo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(imgUrl)}
                          className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold shadow-xs transition"
                        >
                          Make Cover
                        </button>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSalonImage(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Upload Dropzone Tile */}
              <button
                type="button"
                onClick={() => salonFileInputRef.current?.click()}
                className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  isDarkMode
                    ? 'border-slate-700 text-slate-400'
                    : 'border-slate-300 text-slate-500'
                }`}
              >
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-bold text-center leading-tight">
                  + Add More Photos
                </span>
                <span className="text-[9px] opacity-75">From Gallery/Files</span>
              </button>
            </div>
          </div>

          {/* Owner Photo Upload */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200">
              Owner Photo
            </label>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={ownerPhoto}
                  alt={ownerName || 'Owner'}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600/60 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => ownerFileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                  title="Change photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => ownerFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Upload Owner Photo</span>
                </button>
                <p className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                  Select photo from your device files or camera roll.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SERVICES - Visible ONLY during new registration! Services are managed exclusively in "Services & Estimated Times" */}
        {!existingSalon ? (
          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDarkMode
                ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <BrandLogo className="w-4 h-4 grayscale opacity-80" />
                <span>Services & Estimated Wait Times</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                Initial Setup
              </span>
            </div>

            <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
              Choose which services your salon provides, set their price (₹) and estimated time (min). These times are directly used to calculate customer queue wait times!
            </p>

            <ServiceManager
              services={services}
              onChange={setServices}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <div
            className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${
              isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-blue-50/60 border-blue-200/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <BrandLogo size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC]">
                  Services & Estimated Times
                </h4>
                <p className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                  Services are managed exclusively in the dedicated <strong>Services &amp; Estimated Times</strong> section.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CAPACITY (BARBERS & SEATS) */}
        <div
          className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Capacity & Stations</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Number of Barbers */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-2">
                Number of Barbers
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setBarbersCount((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  -
                </button>
                <span className="font-mono font-black text-lg text-blue-700 dark:text-blue-400">
                  {barbersCount}
                </span>
                <button
                  type="button"
                  onClick={() => setBarbersCount((prev) => Math.min(8, prev + 1))}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Number of Seats */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isDarkMode ? 'bg-[#0B1120]/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/90'
              }`}
            >
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-2">
                Number of Seats / Chairs
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSeatsCount((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  -
                </button>
                <span className="font-mono font-black text-lg text-blue-700 dark:text-blue-400">
                  {seatsCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatsCount((prev) => Math.min(10, prev + 1))}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: LOCATION */}
        <div
          className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Salon Location</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Locality / Area Name *
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Indiranagar 100ft Road"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Full Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop #12, 1st Floor, Near Metro Station"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A] placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                }`}
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: BUSINESS HOURS & AUTOMATIC STATUS LOGIC */}
        <div
          className={`p-5 rounded-3xl border space-y-4 ${
            isDarkMode
              ? 'bg-[#131D31] border-slate-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Business Operating Hours</span>
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
              Automatic Open/Closed
            </span>
          </div>

          <p className="text-xs text-[#334155] dark:text-[#94A3B8]">
            Your salon is automatically marked <strong>OPEN</strong> during operating hours and <strong>CLOSED</strong> outside them.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Opening Time
              </label>
              <select
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                }`}
              >
                <option value="07:00 AM">7:00 AM</option>
                <option value="07:30 AM">7:30 AM</option>
                <option value="08:00 AM">8:00 AM</option>
                <option value="08:30 AM">8:30 AM</option>
                <option value="09:00 AM">9:00 AM</option>
                <option value="09:30 AM">9:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 mb-1">
                Closing Time
              </label>
              <select
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDarkMode
                    ? 'bg-[#0B1120] border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-[#0F172A]'
                }`}
              >
                <option value="08:00 PM">8:00 PM</option>
                <option value="08:30 PM">8:30 PM</option>
                <option value="09:00 PM">9:00 PM</option>
                <option value="09:30 PM">9:30 PM</option>
                <option value="10:00 PM">10:00 PM</option>
                <option value="10:30 PM">10:30 PM</option>
                <option value="11:00 PM">11:00 PM</option>
              </select>
            </div>
          </div>

          {/* Current Status Calculated Live */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              scheduleStatus.isOpen
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
                : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  scheduleStatus.isOpen ? 'bg-blue-600 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                Live Status: {scheduleStatus.statusLabel}
              </span>
            </div>
          </div>

          {/* Manual Open/Close Override Switch */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-slate-200 block">
                  Manual Open / Close Override
                </span>
                <span className="text-[11px] text-[#334155] dark:text-[#94A3B8]">
                  For festivals, power cuts, or emergencies
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsManualOverride(!isManualOverride)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  isManualOverride ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    isManualOverride ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {isManualOverride && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualOpenStatus(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    manualOpenStatus
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Force OPEN
                </button>
                <button
                  type="button"
                  onClick={() => setManualOpenStatus(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    !manualOpenStatus
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Force CLOSED
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm tracking-wide shadow-lg transition flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          <span>{existingSalon ? 'Save Profile & Schedule' : 'Register Salon on Find My Token'}</span>
        </button>
      </form>
    </div>
  );
};
