// Date and Calendar-Month Calculation Utilities for APD MUSIC CLASS
// Implements exact calendar-month arithmetic (not 30-day approximations)

import { ACADEMY_CONFIG, MembershipStatus } from '../config/constants';

/**
 * Adds exact calendar months to a given date.
 * Respects variable month lengths (28/29 days in Feb, 30 days in Apr/Jun/Sep/Nov, 31 in Jan/Mar/May/Jul/Aug/Oct/Dec).
 * If the target month has fewer days than the start day (e.g., Jan 31 + 1 month), clamps to the last day of target month (Feb 28/29).
 */
export function addCalendarMonths(startDateInput: Date | string, monthsToAdd: number): Date {
  const d = new Date(startDateInput);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid start date provided: ${startDateInput}`);
  }

  const startDay = d.getUTCDate();
  const startMonth = d.getUTCMonth();
  const startYear = d.getUTCFullYear();

  // Target year and month calculation
  const totalMonths = startMonth + monthsToAdd;
  const targetYear = startYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  // Determine total days in target month
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

  // Clamp day if necessary
  const targetDay = Math.min(startDay, daysInTargetMonth);

  const result = new Date(Date.UTC(
    targetYear,
    targetMonth,
    targetDay,
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds()
  ));

  return result;
}

/**
 * Calculates remaining days between current date and expiry date.
 * Normalizes both to midnight UTC for clean calendar day counting.
 */
export function calculateRemainingDays(expiryDateInput: Date | string, referenceDateInput?: Date | string): number {
  const expiry = new Date(expiryDateInput);
  const now = referenceDateInput ? new Date(referenceDateInput) : new Date();

  // Zero out time components for day difference
  const utcExpiry = Date.UTC(expiry.getUTCFullYear(), expiry.getUTCMonth(), expiry.getUTCDate());
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const diffMs = utcExpiry - utcNow;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Derives dynamic membership status based on remaining days, payment state, and suspension flag.
 */
export function determineMembershipStatus(
  expiryDateInput: Date | string,
  paymentStatus: string,
  isSuspended = false,
  referenceDateInput?: Date | string
): MembershipStatus {
  if (paymentStatus !== 'COLLECTED' && paymentStatus !== 'Paid') {
    return 'PENDING_PAYMENT';
  }

  if (isSuspended) {
    return 'SUSPENDED';
  }

  const daysRemaining = calculateRemainingDays(expiryDateInput, referenceDateInput);

  if (daysRemaining < 0) {
    return 'EXPIRED';
  }

  if (daysRemaining <= 15) {
    return 'EXPIRING_SOON';
  }

  return 'ACTIVE';
}

/**
 * Computes renewal dates without losing member's active days.
 * If the current membership is still active, the renewed period extends from the current expiry date.
 * If already expired, the renewed period begins today.
 */
export function computeRenewalDates(
  currentExpiryDateInput: Date | string,
  renewalMonths: number,
  nowInput?: Date | string
): { newStartDate: Date; newExpiryDate: Date; daysAdded: number } {
  const currentExpiry = new Date(currentExpiryDateInput);
  const now = nowInput ? new Date(nowInput) : new Date();

  const isStillActive = currentExpiry.getTime() > now.getTime();
  const newStartDate = isStillActive ? currentExpiry : now;
  const newExpiryDate = addCalendarMonths(newStartDate, renewalMonths);

  const daysAdded = calculateRemainingDays(newExpiryDate, newStartDate);

  return {
    newStartDate,
    newExpiryDate,
    daysAdded
  };
}

/**
 * Returns formatted ISO date string YYYY-MM-DD
 */
export function toISODateOnly(dateInput: Date | string): string {
  const d = new Date(dateInput);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates formatted membership expiry date string YYYY-MM-DD
 */
export function calculateMembershipExpiry(startDateInput: Date | string, monthsToAdd: number): string {
  const exp = addCalendarMonths(startDateInput, monthsToAdd);
  return toISODateOnly(exp);
}

/**
 * Computes non-destructive renewal date strings YYYY-MM-DD
 */
export function calculateRenewalDates(
  currentExpiryDateInput: Date | string,
  renewalMonths: number,
  nowInput?: Date | string
): { renewalStartDate: string; renewalExpiryDate: string; daysAdded: number } {
  const res = computeRenewalDates(currentExpiryDateInput, renewalMonths, nowInput);
  return {
    renewalStartDate: toISODateOnly(res.newStartDate),
    renewalExpiryDate: toISODateOnly(res.newExpiryDate),
    daysAdded: res.daysAdded
  };
}

/**
 * Validates whether string is a valid real calendar date (e.g. rejecting 2026-02-29)
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10) - 1;
  const d = parseInt(dayStr, 10);

  const date = new Date(Date.UTC(y, m, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m && date.getUTCDate() === d;
}

