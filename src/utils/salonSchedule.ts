import { Salon } from '../types';

/**
 * Converts a time string (e.g. "08:00 AM", "8:00 AM", "21:00", "9:00 PM")
 * to minutes from midnight (0 - 1439).
 */
export function timeStringToMinutes(timeStr?: string): number {
  if (!timeStr) return 9 * 60; // default 9:00 AM = 540 mins

  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');

  const parts = cleaned.replace(/[APM\s]/g, '').split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Checks whether a salon is currently open based on auto schedule
 * or manual override.
 */
export function checkSalonOpenStatus(salon: Salon): {
  isOpen: boolean;
  statusLabel: string;
  isManual: boolean;
} {
  if (salon.isManualOverride) {
    const isManuallyOpen = Boolean(salon.manualOpenStatus);
    return {
      isOpen: isManuallyOpen,
      statusLabel: isManuallyOpen ? 'OPEN (Manual Override)' : 'CLOSED (Manual Override)',
      isManual: true,
    };
  }

  // Automatic schedule check
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMinutes = timeStringToMinutes(salon.openingTime || '08:00 AM');
  const closeMinutes = timeStringToMinutes(salon.closingTime || '09:00 PM');

  let isAutoOpen = false;
  if (closeMinutes > openMinutes) {
    isAutoOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } else {
    // Overnight hours (e.g. 10 PM to 4 AM)
    isAutoOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }

  const openDisplay = salon.openingTime || '8:00 AM';
  const closeDisplay = salon.closingTime || '9:00 PM';

  return {
    isOpen: isAutoOpen,
    statusLabel: isAutoOpen
      ? `OPEN (${openDisplay} – ${closeDisplay})`
      : `CLOSED (Hours: ${openDisplay} – ${closeDisplay})`,
    isManual: false,
  };
}
