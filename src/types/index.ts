// Core Domain Types for APD MUSIC CLASS

export type InstrumentId = 'guitar' | 'piano' | 'drums' | 'sitar' | 'violin' | 'ukulele' | 'trumpet';

export interface Instrument {
  id: InstrumentId;
  name: string;
  category: 'Strings' | 'Percussion' | 'Wind' | 'Indian Classical';
  description: string;
  longDescription: string;
  startingPricePerMonth: number;
  availableBranches: BranchId[];
  skillLevels: ('Beginner' | 'Intermediate' | 'Advanced')[];
  imagePlaceholder: string;
  popularFor: string[];
}

export type BranchId = 'madhapur' | 'kokila' | 'himayatnagar';

export interface Branch {
  id: BranchId;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  availableInstruments: InstrumentId[];
  dailyClassHours: string; // "8:00 AM - 6:00 PM"
  classSlotsCount: number; // 10
  amenities: string[];
  imagePlaceholder: string;
  activeStudentsCount: number;
}

export type MembershipDuration = '1-month' | '3-months' | '6-months' | '12-months';

export interface MembershipPlanTier {
  id: MembershipDuration;
  months: number;
  title: string;
  description: string;
  discountPercentage: number;
  badge?: string;
  features: string[];
}

export interface TimeSlot {
  id: number; // 1 to 10
  label: string; // e.g. "8:00 AM–9:00 AM"
  startTime: string; // "08:00"
  endTime: string; // "09:00"
}

export type SlotStatus = 'available' | 'booked' | 'unavailable' | 'selected';

export interface Member {
  id: string; // e.g. "APD-M-1001"
  name: string;
  email: string;
  phone: string;
  enrolledInstrumentId: InstrumentId;
  branchId: BranchId;
  planDuration: MembershipDuration;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended';
  notes?: string;
  emergencyContact?: string;
  totalClassesAttended: number;
}

export interface Teacher {
  id: string; // e.g. "APD-T-201"
  name: string;
  email: string;
  phone: string;
  instrumentsTaught: InstrumentId[];
  assignedBranches: BranchId[];
  availability: 'Full Time' | 'Part Time' | 'Weekend Specialist';
  employmentStatus: 'Active' | 'On Leave' | 'Contract';
  joiningDate: string;
  bio: string;
  rating: number;
}

export interface Booking {
  id: string; // e.g. "APD-BKG-8801"
  memberId: string;
  memberName: string;
  memberEmail: string;
  instrumentId: InstrumentId;
  branchId: BranchId;
  planDuration: MembershipDuration;
  bookingDate: string; // Date of booking creation
  firstClassDate: string; // Date chosen for first slot
  slotId: number; // 1 to 10
  slotLabel: string;
  baseFee: number;
  discountAmount: number;
  totalPayable: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  bookingStatus: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  paymentMode?: 'UPI' | 'Card' | 'Net Banking' | 'Demo Cash';
}

export interface PaymentRecord {
  id: string; // e.g. "RCPT-9041"
  bookingId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  date: string;
  method: 'UPI' | 'Card' | 'Net Banking' | 'Cash';
  status: 'Collected' | 'Pending' | 'Refunded';
  instrumentId: InstrumentId;
  branchId: BranchId;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'Studio Rent' | 'Teacher Compensation' | 'Equipment & Maintenance' | 'Utilities & Acoustic Tech' | 'Marketing';
  branchId: BranchId;
  amount: number;
  date: string;
  vendorOrRecipient: string;
  paymentStatus: 'Paid' | 'Scheduled';
}

export type UserRole = 'guest' | 'client' | 'owner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  memberId?: string; // If role is client
}
