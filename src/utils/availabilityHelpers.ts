/**
 * Availability Helpers (v2 - Simplifié)
 * Génère les créneaux depuis openingHours, vérifie contre les bookings
 */

import { parseLocalDateTime } from './dateHelpers';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';
import { addDays, startOfDay } from 'date-fns';

interface OpeningHours {
  [key: string]: string; // "monday": "09:00-17:00" ou "Closed"
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Parse les horaires d'ouverture pour un jour donné
 * @returns { start: Date, end: Date } ou null si fermé
 */
export function parseOpeningHoursForDay(
  openingHours: OpeningHours,
  date: Date
): { start: Date; end: Date } | null {
  const dayName = DAY_NAMES[date.getDay()];
  const hours = openingHours[dayName];

  if (!hours || hours.toLowerCase() === 'closed' || hours === '') {
    return null;
  }

  // Normaliser le format avant de parser
  // Accepte: "09:00-17:00", "9:00 - 18:00", "9h-18h", "9h00 - 18h00", "9h – 18h"
  const normalized = hours
    .replace(/\s+/g, '')          // supprimer les espaces
    .replace(/[–—]/g, '-')        // tiret long → tiret court
    .replace(/h(\d{2})/gi, ':$1') // "9h30" → "9:30"
    .replace(/h(?=-|$)/gi, ':00');// "9h" seul ou avant "-" → "9:00"

  const match = normalized.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!match) {
    console.warn(`Format horaire invalide pour ${dayName}: ${hours}`);
    return null;
  }

  const [, startHour, startMin, endHour, endMin] = match;

  const start = new Date(date);
  start.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

  const end = new Date(date);
  end.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

  return { start, end };
}

/**
 * Génère tous les créneaux possibles pour une plage horaire
 */
export function generateTimeSlots(
  start: Date,
  end: Date,
  granularity: number
): Date[] {
  const slots: Date[] = [];
  const current = new Date(start);

  while (current < end) {
    slots.push(new Date(current));
    current.setMinutes(current.getMinutes() + granularity);
  }

  return slots;
}

/**
 * Vérifie si un créneau est disponible (pas de conflit avec bookings existants)
 */
export function isTimeSlotAvailable(
  startTime: Date,
  serviceDuration: number,
  bookings: Booking[],
  openingHours: OpeningHours
): boolean {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + serviceDuration);

  // 1. Vérifier que le créneau est dans les horaires d'ouverture
  const dayHours = parseOpeningHoursForDay(openingHours, startTime);
  if (!dayHours) {
    return false;
  }

  // Vérifier que le service entier tient dans la plage d'ouverture
  if (startTime < dayHours.start || endTime > dayHours.end) {
    return false;
  }

  // 2. Vérifier qu'il n'y a pas de conflit avec les bookings existants
  const hasConflict = bookings.some((booking) => {
    if (!booking.start_time || !booking.end_time) return false;
    if (booking.status && booking.status !== BOOKING_STATUS.CONFIRMED) return false;

    const bookingStart = parseLocalDateTime(booking.start_time);
    const bookingEnd = parseLocalDateTime(booking.end_time);

    // Chevauchement si les intervalles se superposent
    const hasOverlap = !(endTime <= bookingStart || startTime >= bookingEnd);
    return hasOverlap;
  });

  return !hasConflict;
}

/**
 * Calcule tous les créneaux disponibles pour un service sur une période
 * @param serviceDuration - Durée du service en minutes
 * @param bookings - Réservations existantes
 * @param openingHours - Horaires d'ouverture depuis config
 * @param granularity - Granularité en minutes (ex: 10)
 * @param maxDays - Nombre de jours à générer (défaut: 60)
 */
export function getAvailableTimeSlotsForService(
  serviceDuration: number,
  bookings: Booking[],
  openingHours: OpeningHours,
  granularity: number,
  maxDays: number = 60
): Date[] {
  const availableSlots: Date[] = [];
  const now = new Date();
  const today = startOfDay(now);

  // Générer pour les X prochains jours
  for (let i = 0; i < maxDays; i++) {
    const date = addDays(today, i);
    const dayHours = parseOpeningHoursForDay(openingHours, date);

    if (!dayHours) {
      continue; // Jour fermé
    }

    // Générer tous les créneaux pour ce jour
    const daySlots = generateTimeSlots(dayHours.start, dayHours.end, granularity);

    // Filtrer les créneaux valides
    daySlots.forEach((slotStart) => {
      // Ne pas afficher les créneaux passés
      if (slotStart <= now) {
        return;
      }

      // Vérifier que le service entier peut être fait avant la fermeture
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + serviceDuration);
      if (slotEnd > dayHours.end) {
        return;
      }

      // Vérifier disponibilité
      if (isTimeSlotAvailable(slotStart, serviceDuration, bookings, openingHours)) {
        availableSlots.push(slotStart);
      }
    });
  }

  return availableSlots;
}
