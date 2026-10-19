// Core Academy Constants & Configurations for APD MUSIC CLASS

export const ACADEMY_CONFIG = {
  BRAND_NAME: 'APD MUSIC CLASS',
  PRIMARY_COLOR: '#C654C3',
  TIMEZONE: 'Asia/Kolkata', // Authoritative academy business timezone
  OPENING_HOUR: 8, // 8:00 AM
  CLOSING_HOUR: 18, // 6:00 PM
  SLOT_DURATION_MINUTES: 60,
  TOTAL_DAILY_SLOTS: 10,
  MIN_RESCHEDULE_NOTICE_HOURS: 24, // Notice required to reschedule without penalty
  CANCELLATION_REFUND_WINDOW_DAYS: 7 // Days within which full refund can be requested
} as const;

export const ACADEMY_TIMEZONE = ACADEMY_CONFIG.TIMEZONE;

// 1. SUPPORTED 7 INSTRUMENTS
export const INSTRUMENT_IDS = [
  'guitar',
  'piano',
  'drums',
  'sitar',
  'violin',
  'ukulele',
  'trumpet'
] as const;

export type InstrumentId = (typeof INSTRUMENT_IDS)[number];

// 2. SUPPORTED 3 STUDIO BRANCHES
export const BRANCH_IDS = ['madhapur', 'kokila', 'himayatnagar'] as const;

export type BranchId = (typeof BRANCH_IDS)[number];

// 3. MEMBERSHIP DURATIONS
export const MEMBERSHIP_DURATIONS = [
  '1-month',
  '3-months',
  '6-months',
  '12-months'
] as const;

export type MembershipDuration = (typeof MEMBERSHIP_DURATIONS)[number];

export const DURATION_MONTHS_MAP: Record<MembershipDuration, number> = {
  '1-month': 1,
  '3-months': 3,
  '6-months': 6,
  '12-months': 12
};

// 4. TEN CONSECUTIVE ONE-HOUR SLOTS (08:00 to 18:00)
export interface ClassSlotDefinition {
  id: number;
  slotNumber: number;
  label: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export const ACADEMY_SLOTS: ClassSlotDefinition[] = [
  { id: 1, slotNumber: 1, label: '08:00–09:00', startTime: '08:00', endTime: '09:00' },
  { id: 2, slotNumber: 2, label: '09:00–10:00', startTime: '09:00', endTime: '10:00' },
  { id: 3, slotNumber: 3, label: '10:00–11:00', startTime: '10:00', endTime: '11:00' },
  { id: 4, slotNumber: 4, label: '11:00–12:00', startTime: '11:00', endTime: '12:00' },
  { id: 5, slotNumber: 5, label: '12:00–13:00', startTime: '12:00', endTime: '13:00' },
  { id: 6, slotNumber: 6, label: '13:00–14:00', startTime: '13:00', endTime: '14:00' },
  { id: 7, slotNumber: 7, label: '14:00–15:00', startTime: '14:00', endTime: '15:00' },
  { id: 8, slotNumber: 8, label: '15:00–16:00', startTime: '15:00', endTime: '16:00' },
  { id: 9, slotNumber: 9, label: '16:00–17:00', startTime: '16:00', endTime: '17:00' },
  { id: 10, slotNumber: 10, label: '17:00–18:00', startTime: '17:00', endTime: '18:00' }
];

// 5. STATUS ENUMS
export type UserRole = 'CLIENT' | 'OWNER';

export type MembershipStatus =
  | 'PENDING_PAYMENT'
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUSPENDED';

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'COLLECTED' | 'REFUNDED' | 'FAILED';

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';

export type ExpenseCategory =
  | 'STUDIO_RENT'
  | 'TEACHER_COMPENSATION'
  | 'EQUIPMENT_MAINTENANCE'
  | 'UTILITIES_ACOUSTIC_TECH'
  | 'MARKETING'
  | 'OTHER_OPERATIONAL';
