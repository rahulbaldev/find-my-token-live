export type Role = 'customer' | 'business';

// 5 Business Types specified by user requirement:
// 1. Salons & Barber Shops — Available
// 2. Clinics — Coming Soon
// 3. Restaurants — Coming Soon
// 4. Service Centers — Coming Soon
// 5. Government Offices — Coming Soon
export type BusinessType = 
  | 'salon' 
  | 'clinic' 
  | 'restaurant' 
  | 'service_center' 
  | 'government_office';

export interface BusinessTypeMeta {
  id: BusinessType;
  label: string;
  tagline: string;
  status: 'available' | 'coming_soon';
  statusBadge: string;
  dashboardTitle: string;
  loginTitle: string;
  iconName: 'scissors' | 'stethoscope' | 'utensils' | 'wrench' | 'landmark';
}

export const BUSINESS_TYPES_CONFIG: Record<BusinessType, BusinessTypeMeta> = {
  salon: {
    id: 'salon',
    label: 'Salon & Barber Shop',
    tagline: 'Queue turns, haircut/beard services & barber chairs',
    status: 'available',
    statusBadge: 'AVAILABLE',
    dashboardTitle: 'Salon & Barber Shop Dashboard',
    loginTitle: 'Salon Owner Login',
    iconName: 'scissors',
  },
  clinic: {
    id: 'clinic',
    label: 'Clinic / OPD',
    tagline: 'OPD patient consultation turn numbers & doctors queue',
    status: 'coming_soon',
    statusBadge: 'COMING SOON',
    dashboardTitle: 'Clinic & OPD Patient Dashboard',
    loginTitle: 'Clinic Owner Login',
    iconName: 'stethoscope',
  },
  restaurant: {
    id: 'restaurant',
    label: 'Restaurant / Dine-In',
    tagline: 'Table waitlist, live dine-in buzzers & food order tokens',
    status: 'coming_soon',
    statusBadge: 'COMING SOON',
    dashboardTitle: 'Restaurant & Table Waitlist Dashboard',
    loginTitle: 'Restaurant Owner Login',
    iconName: 'utensils',
  },
  service_center: {
    id: 'service_center',
    label: 'Service Center',
    tagline: 'Automotive service bays & device repair work tokens',
    status: 'coming_soon',
    statusBadge: 'COMING SOON',
    dashboardTitle: 'Service Center Bay Dashboard',
    loginTitle: 'Service Center Owner Login',
    iconName: 'wrench',
  },
  government_office: {
    id: 'government_office',
    label: 'Government / Civic Office',
    tagline: 'Civic counters, citizen token passes & certificate desks',
    status: 'coming_soon',
    statusBadge: 'COMING SOON',
    dashboardTitle: 'Government Office Citizen Token Dashboard',
    loginTitle: 'Government Office Login',
    iconName: 'landmark',
  },
};

export const getBusinessLoginTitle = (type: BusinessType): string => {
  return BUSINESS_TYPES_CONFIG[type]?.loginTitle || 'Salon Owner Login';
};

export interface BusinessAccount {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string; // Formatted "+91 98111 22334"
  rawPhone: string; // "9811122334"
  password?: string;
  businessType: BusinessType;
  salonId?: string;
  createdAt: number;
}

export interface UserSession {
  name: string;
  phone: string;
  role: Role;
  businessType?: BusinessType;
  businessId?: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Hair' | 'Beard' | 'Spa' | 'Color';
  durationMins: number;
  price: number; // in INR ₹
  description: string;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  photo?: string;
  isAvailable?: boolean;
  isActive: boolean;
  barberNumber?: string; // e.g. "Barber A", "Barber 1"
  seatNumber?: number; // 1, 2, 3, 4
}

export type TokenStatus = 'waiting' | 'serving' | 'completed' | 'cancelled';

export type TicketColor = 'orange' | 'pink' | 'yellow' | 'purple' | 'blue' | 'coral' | 'cyan';

export interface QueueToken {
  id: string; // unique UUID
  tokenNumber: string; // e.g. "B-12"
  ticketColor?: TicketColor;
  salonId: string;
  salonName: string;
  customerName: string;
  customerPhone: string;
  services: Service[];
  totalDurationMins: number;
  totalPrice: number;
  status: TokenStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  isWalkIn?: boolean;
  barberName?: string;
  assignedBarber?: string;
  assignedBarberId?: string;
  reminderMinutesBefore?: number; // 5, 10, 15, custom
  estimatedTurnTimestamp?: number; // Calculated timestamp when this token reaches chair
  scheduledAlertTimestamp?: number; // Timestamp when customer pre-alert is scheduled to fire
  preAlertNotifiedAt?: number; // Timestamp when pre-alert was triggered
  servingNotifiedAt?: number; // Timestamp when serving notification was triggered
}

export interface Salon {
  id: string;
  businessType?: BusinessType;
  name: string;
  tagline: string;
  ownerName?: string;
  phone: string;
  registeredPhone?: string;
  ownerPhoto?: string;
  image: string;
  images?: string[];
  locality: string;
  city: string;
  address: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  openingHours: string;
  openingTime?: string; // e.g. "08:00 AM"
  closingTime?: string; // e.g. "09:00 PM"
  isManualOverride?: boolean;
  manualOpenStatus?: boolean;
  activeBarbersCount: number;
  seatsCount?: number;
  barbers: Barber[];
  services: Service[];
}

export type AppTab = 'home' | 'token' | 'more' | 'live_queue' | 'history';

export interface PreviousQueueState {
  servedTokenId: string;
  previousStatus: TokenStatus;
  nextServingTokenId?: string;
  timestamp: number;
}

export type CategoryStatus = 'available' | 'coming_soon';

export interface AppCategory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: 'scissors' | 'stethoscope' | 'building' | 'utensils' | 'landmark' | 'file-text' | 'wrench' | 'sparkles';
  status: CategoryStatus;
  availableCountText?: string;
  isAvailable: boolean;
}
