import { describe, it, expect } from 'vitest';
import {
  addCalendarMonths,
  calculateMembershipExpiry,
  calculateRemainingDays,
  calculateRenewalDates,
  isValidCalendarDate
} from '../src/utils/dateUtils';

describe('Calendar-Month Expiry and Renewal Calculations', () => {
  it('should accurately add 1 calendar month with month-end clamping (Jan 31 -> Feb 28 in non-leap year)', () => {
    // 2025 is non-leap year
    const start = new Date(Date.UTC(2025, 0, 31)); // 2025-01-31
    const end = addCalendarMonths(start, 1);
    expect(end.toISOString().split('T')[0]).toBe('2025-02-28');
  });

  it('should accurately handle leap year February (Jan 31 -> Feb 29 in leap year 2028)', () => {
    // 2028 is leap year
    const start = new Date(Date.UTC(2028, 0, 31)); // 2028-01-31
    const end = addCalendarMonths(start, 1);
    expect(end.toISOString().split('T')[0]).toBe('2028-02-29');
  });

  it('should accurately add 3 calendar months without fixed 30-day drift (Mar 31 -> Jun 30)', () => {
    const start = new Date(Date.UTC(2026, 2, 31)); // 2026-03-31
    const end = addCalendarMonths(start, 3);
    // June only has 30 days
    expect(end.toISOString().split('T')[0]).toBe('2026-06-30');
  });

  it('should accurately add 6 calendar months (Jan 31 -> Jul 31)', () => {
    const start = new Date(Date.UTC(2026, 0, 31)); // 2026-01-31
    const end = addCalendarMonths(start, 6);
    expect(end.toISOString().split('T')[0]).toBe('2026-07-31');
  });

  it('should accurately add 12 calendar months (Feb 29 2024 leap year -> Feb 28 2025 non-leap year)', () => {
    const start = new Date(Date.UTC(2024, 1, 29)); // 2024-02-29
    const end = addCalendarMonths(start, 12);
    expect(end.toISOString().split('T')[0]).toBe('2025-02-28');
  });

  it('should support all standard APD academy plan durations: 1, 3, 6, 12 months', () => {
    const testDate = '2026-10-15';
    
    expect(calculateMembershipExpiry(testDate, 1)).toBe('2026-11-15');
    expect(calculateMembershipExpiry(testDate, 3)).toBe('2027-01-15');
    expect(calculateMembershipExpiry(testDate, 6)).toBe('2027-04-15');
    expect(calculateMembershipExpiry(testDate, 12)).toBe('2027-10-15');
  });

  it('should implement non-destructive renewal anchored to current expiry date for active memberships', () => {
    // Current membership expires on 2026-12-15
    const currentExpiry = '2026-12-15';
    const renewalMonths = 3;

    const { renewalStartDate, renewalExpiryDate } = calculateRenewalDates(currentExpiry, renewalMonths);

    // Anchored to the current expiry date, ensuring 0 paid days lost
    expect(renewalStartDate).toBe('2026-12-15');
    expect(renewalExpiryDate).toBe('2027-03-15');
  });

  it('should anchor renewal to current date if membership has already lapsed in the past', () => {
    // Lapsed 6 months ago
    const pastExpiry = '2025-01-01';
    const renewalMonths = 1;

    const { renewalStartDate, renewalExpiryDate } = calculateRenewalDates(pastExpiry, renewalMonths);

    const todayStr = new Date().toISOString().split('T')[0];
    expect(renewalStartDate).toBe(todayStr);
    expect(renewalExpiryDate).toBe(calculateMembershipExpiry(todayStr, 1));
  });

  it('should correctly calculate days remaining until expiry', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateStr = futureDate.toISOString().split('T')[0];

    const daysRemaining = calculateRemainingDays(dateStr);
    expect(daysRemaining).toBe(10);
  });

  it('should validate ISO date formats correctly', () => {
    expect(isValidCalendarDate('2026-10-19')).toBe(true);
    expect(isValidCalendarDate('2026-02-29')).toBe(false); // 2026 is not a leap year
    expect(isValidCalendarDate('invalid-date')).toBe(false);
  });
});
