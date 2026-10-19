// Enterprise Repository & Transaction Engine for APD MUSIC CLASS
// Implements transactional isolation, concurrency conflict detection, and typed relational contracts

import {
  INSTRUMENT_IDS,
  BRANCH_IDS,
  ACADEMY_SLOTS,
  MembershipStatus,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  ExpenseCategory,
  UserRole
} from '../config/constants';
import { ConflictError, NotFoundError } from '../utils/errors';
import { addCalendarMonths, calculateRemainingDays, toISODateOnly } from '../utils/dateUtils';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRecord {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  enrolledInstrumentId: string;
  branchId: string;
  status: MembershipStatus;
  notes?: string;
  emergencyContact?: string;
  totalClassesAttended: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherRecord {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  instrumentsTaught: string[];
  assignedBranches: string[];
  availability: string;
  employmentStatus: string;
  joiningDate: string;
  bio?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  startingPricePerMonth: number;
  availableBranches: string[];
  isActive: boolean;
}

export interface BranchRecord {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  dailyClassHours: string;
  classSlotsCount: number;
  availableInstruments: string[];
  isActive: boolean;
}

export interface MembershipPlanRecord {
  id: string;
  durationMonths: number;
  title: string;
  description: string;
  discountPercentage: number;
  badge?: string;
  isActive: boolean;
}

export interface MembershipRecord {
  id: string;
  memberId: string;
  planId: string;
  instrumentId: string;
  branchId: string;
  startDate: string;
  expiryDate: string;
  status: MembershipStatus;
  paymentStatus: PaymentStatus;
  totalFee: number;
  discountAmount: number;
  payableAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  membershipId?: string;
  memberId: string;
  branchId: string;
  instrumentId: string;
  teacherId?: string;
  classDate: string; // YYYY-MM-DD
  slotId: number; // 1 to 10
  slotLabel: string;
  status: BookingStatus;
  roomNumber: number;
  paymentMode?: string;
  cancellationReason?: string;
  rescheduledFromId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId?: string;
  membershipId?: string;
  memberId: string;
  branchId: string;
  instrumentId?: string;
  amount: number;
  refundAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  branchId: string;
  instrumentId?: string;
  amount: number;
  vendor: string;
  date: string;
  paymentStatus: 'PAID' | 'SCHEDULED';
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByUserId?: string;
  changes?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface RoomRecord {
  id: string;
  branchId: string;
  roomNumber: number;
  name: string;
  acousticType: string;
  capacity: number;
  isActive: boolean;
}

export interface ClassSlotRecord {
  id: number;
  slotNumber: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  processedByUserId?: string;
  gatewayRefundRef?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// Initial Database Snapshot (Deterministic Seed Data)
function getInitialData() {
  const users: UserRecord[] = [
    {
      id: 'USR-O-001',
      email: 'director@apdmusicclass.com',
      passwordHash: '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e', // password123
      fullName: 'Dr. Alok Prasad',
      phone: '+91 40 4821 7733',
      role: 'OWNER',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'USR-C-101',
      email: 'aarav.patel@example.com',
      passwordHash: '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e', // password123
      fullName: 'Aarav Patel',
      phone: '+91 98765 43210',
      role: 'CLIENT',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'USR-C-102',
      email: 'sanya.reddy@example.com',
      passwordHash: '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e',
      fullName: 'Sanya Reddy',
      phone: '+91 98490 11223',
      role: 'CLIENT',
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: '2026-07-15T00:00:00.000Z'
    }
  ];

  const instruments: InstrumentRecord[] = [
    {
      id: 'guitar',
      name: 'Guitar',
      category: 'Strings',
      description: 'Master acoustic chords, fingerstyle patterns, and electric guitar solos with customized progression roadmaps.',
      startingPricePerMonth: 3200,
      availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
      isActive: true
    },
    {
      id: 'piano',
      name: 'Piano',
      category: 'Strings',
      description: 'Develop two-hand coordination, dynamic phrasing, classical sight-reading, and contemporary keyboard mastery.',
      startingPricePerMonth: 4000,
      availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
      isActive: true
    },
    {
      id: 'drums',
      name: 'Drums',
      category: 'Percussion',
      description: 'Build precise limb independence, rhythm lock, groove control, and high-energy fills on acoustic drum kits.',
      startingPricePerMonth: 3800,
      availableBranches: ['madhapur', 'kokila'],
      isActive: true
    },
    {
      id: 'sitar',
      name: 'Sitar',
      category: 'Indian Classical',
      description: 'Immerse yourself in authentic Indian Classical music, Raag theory, Meend, Taans, and traditional Alaap.',
      startingPricePerMonth: 3500,
      availableBranches: ['kokila', 'himayatnagar'],
      isActive: true
    },
    {
      id: 'violin',
      name: 'Violin',
      category: 'Strings',
      description: 'Refine delicate bow stroke dynamics, pure microtonal intonation, and expressive vibrato in Western or Carnatic styles.',
      startingPricePerMonth: 3600,
      availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
      isActive: true
    },
    {
      id: 'ukulele',
      name: 'Ukulele',
      category: 'Strings',
      description: 'The joyful, accessible stringed instrument perfect for swift rhythm chord fluency and expressive vocal backing.',
      startingPricePerMonth: 2600,
      availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
      isActive: true
    },
    {
      id: 'trumpet',
      name: 'Trumpet',
      category: 'Wind',
      description: 'Command resonant brass acoustics with proper lip embouchure, breath compression, and soaring dynamic power.',
      startingPricePerMonth: 3900,
      availableBranches: ['madhapur', 'kokila'],
      isActive: true
    }
  ];

  const branches: BranchRecord[] = [
    {
      id: 'madhapur',
      name: 'Madhapur',
      city: 'Hyderabad',
      area: 'Hitec City Core',
      address: 'Plot 42, 3rd Floor, Westline Hub, Near Inorbit Mall & Hitec City Metro, Madhapur, Hyderabad, Telangana 500081',
      phone: '+91 40 2980 4421',
      email: 'madhapur@apdmusicclass.com',
      dailyClassHours: '8:00 AM - 6:00 PM',
      classSlotsCount: 10,
      availableInstruments: ['guitar', 'piano', 'drums', 'violin', 'ukulele', 'trumpet'],
      isActive: true
    },
    {
      id: 'kokila',
      name: 'Kokila',
      city: 'Hyderabad',
      area: 'Financial District Campus',
      address: 'Kokila Academy Pavilion, Symphony Block, Opp. SEZ Boulevard, Kokapet Road, Hyderabad, Telangana 500075',
      phone: '+91 40 4821 7733',
      email: 'kokila@apdmusicclass.com',
      dailyClassHours: '8:00 AM - 6:00 PM',
      classSlotsCount: 10,
      availableInstruments: ['guitar', 'piano', 'drums', 'sitar', 'violin', 'ukulele', 'trumpet'],
      isActive: true
    },
    {
      id: 'himayatnagar',
      name: 'Himayatnagar',
      city: 'Hyderabad',
      area: 'Central Heritage Studio',
      address: 'Liberty Tower, 2nd Floor, Above Heritage Bank, Liberty Junction, Himayatnagar, Hyderabad, Telangana 500029',
      phone: '+91 40 2322 1890',
      email: 'himayatnagar@apdmusicclass.com',
      dailyClassHours: '8:00 AM - 6:00 PM',
      classSlotsCount: 10,
      availableInstruments: ['guitar', 'piano', 'sitar', 'violin', 'ukulele'],
      isActive: true
    }
  ];

  const plans: MembershipPlanRecord[] = [
    {
      id: '1-month',
      durationMonths: 1,
      title: '1 Month Explorer',
      description: 'Perfect for beginners testing their rhythm and building fundamental habit.',
      discountPercentage: 0,
      isActive: true
    },
    {
      id: '3-months',
      durationMonths: 3,
      title: '3 Months Foundation',
      description: 'Our most popular milestone to build solid technique and muscle memory.',
      discountPercentage: 8,
      badge: 'Popular',
      isActive: true
    },
    {
      id: '6-months',
      durationMonths: 6,
      title: '6 Months Mastery',
      description: 'Designed for serious students aiming for stage recitals and advanced repertoire.',
      discountPercentage: 15,
      badge: 'Recommended',
      isActive: true
    },
    {
      id: '12-months',
      durationMonths: 12,
      title: '12 Months Artist Academy',
      description: 'Comprehensive year-long music mentorship with certification and recording opportunities.',
      discountPercentage: 25,
      badge: 'Best Value',
      isActive: true
    }
  ];

  const members: MemberRecord[] = [
    {
      id: 'APD-M-1001',
      userId: 'USR-C-101',
      fullName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      enrolledInstrumentId: 'piano',
      branchId: 'kokila',
      status: 'ACTIVE',
      notes: 'Grade 3 Trinity candidate. Focuses on Chopin Nocturnes.',
      emergencyContact: '+91 98765 43219',
      totalClassesAttended: 16,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'APD-M-1002',
      userId: 'USR-C-102',
      fullName: 'Sanya Reddy',
      email: 'sanya.reddy@example.com',
      phone: '+91 98490 11223',
      enrolledInstrumentId: 'guitar',
      branchId: 'madhapur',
      status: 'EXPIRING_SOON',
      notes: 'Fingerstyle enthusiast. Learning John Mayer acoustic riffs.',
      emergencyContact: '+91 98490 99887',
      totalClassesAttended: 22,
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: '2026-07-15T00:00:00.000Z'
    }
  ];

  const teachers: TeacherRecord[] = [
    {
      id: 'APD-T-201',
      fullName: 'David Christopher',
      email: 'david.c@apdmusicclass.com',
      phone: '+91 98200 11445',
      instrumentsTaught: ['guitar', 'ukulele'],
      assignedBranches: ['madhapur', 'kokila'],
      availability: 'Full Time',
      employmentStatus: 'Active',
      joiningDate: '2022-04-15',
      bio: 'Berklee-trained guitarist and multi-instrumentalist with 14 years of live performance and academy teaching experience.',
      rating: 4.9,
      isActive: true,
      createdAt: '2022-04-15T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'APD-T-202',
      fullName: 'Nandini Swaminathan',
      email: 'nandini.s@apdmusicclass.com',
      phone: '+91 98410 77889',
      instrumentsTaught: ['piano', 'violin'],
      assignedBranches: ['kokila', 'himayatnagar'],
      availability: 'Full Time',
      employmentStatus: 'Active',
      joiningDate: '2021-08-01',
      bio: 'Trinity College London Fellow (FTCL). Concert pianist and classical violinist mentoring award-winning youth performers.',
      rating: 5.0,
      isActive: true,
      createdAt: '2021-08-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'APD-T-203',
      fullName: 'Vikramaditya Rao',
      email: 'vikram.rao@apdmusicclass.com',
      phone: '+91 98860 33221',
      instrumentsTaught: ['drums'],
      assignedBranches: ['madhapur', 'kokila'],
      availability: 'Full Time',
      employmentStatus: 'Active',
      joiningDate: '2023-01-10',
      bio: 'Session drummer for indie rock collectives and jazz fusion trios.',
      rating: 4.8,
      isActive: true,
      createdAt: '2023-01-10T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'APD-T-204',
      fullName: 'Pandit Someshwar Banerjee',
      email: 'someshwar.b@apdmusicclass.com',
      phone: '+91 97480 66554',
      instrumentsTaught: ['sitar'],
      assignedBranches: ['kokila', 'himayatnagar'],
      availability: 'Part Time',
      employmentStatus: 'Active',
      joiningDate: '2021-02-15',
      bio: 'Maihar Gharana disciple with 25 years of riyaaz.',
      rating: 5.0,
      isActive: true,
      createdAt: '2021-02-15T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  const memberships: MembershipRecord[] = [
    {
      id: 'MEM-8801',
      memberId: 'APD-M-1001',
      planId: '6-months',
      instrumentId: 'piano',
      branchId: 'kokila',
      startDate: '2026-08-01',
      expiryDate: toISODateOnly(addCalendarMonths('2026-08-01', 6)), // 2027-02-01
      status: 'ACTIVE',
      paymentStatus: 'COLLECTED',
      totalFee: 24000,
      discountAmount: 3600,
      payableAmount: 20400,
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'MEM-8802',
      memberId: 'APD-M-1002',
      planId: '3-months',
      instrumentId: 'guitar',
      branchId: 'madhapur',
      startDate: '2026-07-25',
      expiryDate: toISODateOnly(addCalendarMonths('2026-07-25', 3)), // 2026-10-25
      status: 'EXPIRING_SOON',
      paymentStatus: 'COLLECTED',
      totalFee: 9600,
      discountAmount: 768,
      payableAmount: 8832,
      createdAt: '2026-07-25T00:00:00.000Z',
      updatedAt: '2026-07-25T00:00:00.000Z'
    }
  ];

  const bookings: BookingRecord[] = [
    {
      id: 'APD-BKG-8801',
      membershipId: 'MEM-8801',
      memberId: 'APD-M-1001',
      branchId: 'kokila',
      instrumentId: 'piano',
      teacherId: 'APD-T-202',
      classDate: '2026-10-25',
      slotId: 3,
      slotLabel: '10:00–11:00',
      status: 'CONFIRMED',
      roomNumber: 1,
      paymentMode: 'UPI',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'APD-BKG-8802',
      membershipId: 'MEM-8802',
      memberId: 'APD-M-1002',
      branchId: 'madhapur',
      instrumentId: 'guitar',
      teacherId: 'APD-T-201',
      classDate: '2026-10-26',
      slotId: 7,
      slotLabel: '14:00–15:00',
      status: 'CONFIRMED',
      roomNumber: 2,
      paymentMode: 'CARD',
      createdAt: '2026-07-25T00:00:00.000Z',
      updatedAt: '2026-07-25T00:00:00.000Z'
    }
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'RCPT-9041',
      bookingId: 'APD-BKG-8801',
      membershipId: 'MEM-8801',
      memberId: 'APD-M-1001',
      branchId: 'kokila',
      instrumentId: 'piano',
      amount: 20400,
      refundAmount: 0,
      method: 'UPI',
      status: 'COLLECTED',
      transactionRef: 'UPI-TXN-998822',
      createdAt: '2026-08-01T10:15:00.000Z'
    },
    {
      id: 'RCPT-9042',
      bookingId: 'APD-BKG-8802',
      membershipId: 'MEM-8802',
      memberId: 'APD-M-1002',
      branchId: 'madhapur',
      instrumentId: 'guitar',
      amount: 8832,
      refundAmount: 0,
      method: 'CARD',
      status: 'COLLECTED',
      transactionRef: 'CARD-TXN-110293',
      createdAt: '2026-07-25T14:20:00.000Z'
    }
  ];

  const expenses: ExpenseRecord[] = [
    {
      id: 'EXP-401',
      title: 'Madhapur Studio Lease (Monthly)',
      category: 'STUDIO_RENT',
      branchId: 'madhapur',
      amount: 110000,
      vendor: 'Westline Properties LLP',
      date: '2026-10-01',
      paymentStatus: 'PAID',
      createdAt: '2026-10-01T00:00:00.000Z'
    },
    {
      id: 'EXP-402',
      title: 'Kokila Flagship Pavilion Lease (Monthly)',
      category: 'STUDIO_RENT',
      branchId: 'kokila',
      amount: 165000,
      vendor: 'Symphony Commercial Estates',
      date: '2026-10-01',
      paymentStatus: 'PAID',
      createdAt: '2026-10-01T00:00:00.000Z'
    },
    {
      id: 'EXP-403',
      title: 'Senior Faculty Compensation - David Christopher',
      category: 'TEACHER_COMPENSATION',
      branchId: 'madhapur',
      amount: 62000,
      vendor: 'David Christopher',
      date: '2026-10-05',
      paymentStatus: 'PAID',
      createdAt: '2026-10-05T00:00:00.000Z'
    },
    {
      id: 'EXP-404',
      title: 'Senior Faculty Compensation - Nandini Swaminathan',
      category: 'TEACHER_COMPENSATION',
      branchId: 'kokila',
      amount: 70000,
      vendor: 'Nandini Swaminathan',
      date: '2026-10-05',
      paymentStatus: 'PAID',
      createdAt: '2026-10-05T00:00:00.000Z'
    }
  ];

  const auditLogs: AuditLogRecord[] = [];

  const rooms: RoomRecord[] = [
    { id: 'RM-M-01', branchId: 'madhapur', roomNumber: 1, name: 'Studio 1 - Grand Piano Suite', acousticType: 'PIANO_SUITE', capacity: 1, isActive: true },
    { id: 'RM-M-02', branchId: 'madhapur', roomNumber: 2, name: 'Studio 2 - Sound Isolation Drum Booth', acousticType: 'DRUM_ISOLATION_BOOTH', capacity: 1, isActive: true },
    { id: 'RM-M-03', branchId: 'madhapur', roomNumber: 3, name: 'Studio 3 - Western Strings Suite', acousticType: 'STRINGS_STUDIO', capacity: 1, isActive: true },
    { id: 'RM-M-04', branchId: 'madhapur', roomNumber: 4, name: 'Studio 4 - Contemporary Guitar Lab', acousticType: 'STRINGS_STUDIO', capacity: 1, isActive: true },
    { id: 'RM-M-05', branchId: 'madhapur', roomNumber: 5, name: 'Studio 5 - Acoustic Ensemble Hall', acousticType: 'ENSEMBLE_HALL', capacity: 4, isActive: true },
    { id: 'RM-K-01', branchId: 'kokila', roomNumber: 1, name: 'Studio 1 - Steinway Grand Piano Salon', acousticType: 'PIANO_SUITE', capacity: 1, isActive: true },
    { id: 'RM-K-02', branchId: 'kokila', roomNumber: 2, name: 'Studio 2 - Percussion Sound Isolation Lab', acousticType: 'DRUM_ISOLATION_BOOTH', capacity: 1, isActive: true },
    { id: 'RM-K-03', branchId: 'kokila', roomNumber: 3, name: 'Studio 3 - Indian Classical Raag Chamber', acousticType: 'INDIAN_CLASSICAL_CHAMBER', capacity: 1, isActive: true },
    { id: 'RM-K-04', branchId: 'kokila', roomNumber: 4, name: 'Studio 4 - Acoustic Guitar Suite', acousticType: 'STRINGS_STUDIO', capacity: 1, isActive: true },
    { id: 'RM-K-05', branchId: 'kokila', roomNumber: 5, name: 'Studio 5 - Symphony Masterclass Hall', acousticType: 'ENSEMBLE_HALL', capacity: 4, isActive: true },
    { id: 'RM-H-01', branchId: 'himayatnagar', roomNumber: 1, name: 'Studio 1 - Classical Sitar Mehfil', acousticType: 'INDIAN_CLASSICAL_CHAMBER', capacity: 1, isActive: true },
    { id: 'RM-H-02', branchId: 'himayatnagar', roomNumber: 2, name: 'Studio 2 - Upright Piano Room', acousticType: 'PIANO_SUITE', capacity: 1, isActive: true },
    { id: 'RM-H-03', branchId: 'himayatnagar', roomNumber: 3, name: 'Studio 3 - Violin Intonation Studio', acousticType: 'STRINGS_STUDIO', capacity: 1, isActive: true },
    { id: 'RM-H-04', branchId: 'himayatnagar', roomNumber: 4, name: 'Studio 4 - Fingerstyle Guitar Suite', acousticType: 'STRINGS_STUDIO', capacity: 1, isActive: true },
    { id: 'RM-H-05', branchId: 'himayatnagar', roomNumber: 5, name: 'Studio 5 - Chamber Music Recital Room', acousticType: 'ENSEMBLE_HALL', capacity: 4, isActive: true }
  ];

  const classSlots: ClassSlotRecord[] = ACADEMY_SLOTS.map(s => ({
    id: s.id,
    slotNumber: s.slotNumber,
    label: s.label,
    startTime: s.startTime,
    endTime: s.endTime
  }));

  const refunds: RefundRecord[] = [];
  const notifications: NotificationRecord[] = [];

  return {
    users,
    instruments,
    branches,
    rooms,
    classSlots,
    plans,
    members,
    teachers,
    memberships,
    bookings,
    payments,
    refunds,
    expenses,
    auditLogs,
    notifications
  };
}

class AcademyDatabase {
  private data = getInitialData();

  // Transaction simulation with atomic rollback
  public async runInTransaction<T>(callback: (db: AcademyDatabase) => Promise<T>): Promise<T> {
    // Clone snapshot for potential rollback
    const snapshot = JSON.stringify(this.data);
    try {
      return await callback(this);
    } catch (err) {
      // Revert snapshot on failure
      this.data = JSON.parse(snapshot);
      throw err;
    }
  }

  // --- USERS ---
  public users = {
    findMany: async () => this.data.users,
    findUnique: async ({ email, id }: { email?: string; id?: string }) => {
      if (email) return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
      if (id) return this.data.users.find(u => u.id === id) || null;
      return null;
    },
    create: async (user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newRecord: UserRecord = {
        ...user,
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.users.push(newRecord);
      return newRecord;
    },
    updatePassword: async (id: string, newPasswordHash: string) => {
      const user = this.data.users.find(u => u.id === id);
      if (!user) throw new NotFoundError('User', id);
      user.passwordHash = newPasswordHash;
      user.updatedAt = new Date().toISOString();
      return user;
    }
  };

  // --- MEMBERS ---
  public members = {
    findMany: async () => [...this.data.members],
    findUnique: async (id: string) => this.data.members.find(m => m.id === id) || null,
    findByUserId: async (userId: string) => this.data.members.find(m => m.userId === userId) || null,
    findByEmail: async (email: string) => this.data.members.find(m => m.email.toLowerCase() === email.toLowerCase()) || null,
    create: async (member: Omit<MemberRecord, 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const record: MemberRecord = {
        ...member,
        createdAt: now,
        updatedAt: now
      };
      this.data.members.push(record);
      return record;
    },
    update: async (id: string, updates: Partial<MemberRecord>) => {
      const idx = this.data.members.findIndex(m => m.id === id);
      if (idx === -1) throw new NotFoundError('Member', id);
      const updated = {
        ...this.data.members[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.data.members[idx] = updated;
      return updated;
    }
  };

  // --- TEACHERS ---
  public teachers = {
    findMany: async (filter?: { branchId?: string; instrumentId?: string; isActive?: boolean }) => {
      return this.data.teachers.filter(t => {
        if (filter?.isActive !== undefined && t.isActive !== filter.isActive) return false;
        if (filter?.branchId && !t.assignedBranches.includes(filter.branchId)) return false;
        if (filter?.instrumentId && !t.instrumentsTaught.includes(filter.instrumentId)) return false;
        return true;
      });
    },
    findUnique: async (id: string) => this.data.teachers.find(t => t.id === id) || null,
    create: async (teacher: Omit<TeacherRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const record: TeacherRecord = {
        ...teacher,
        id: `APD-T-${Math.floor(210 + Math.random() * 80)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.teachers.push(record);
      return record;
    },
    update: async (id: string, updates: Partial<TeacherRecord>) => {
      const idx = this.data.teachers.findIndex(t => t.id === id);
      if (idx === -1) throw new NotFoundError('Teacher', id);
      const updated = {
        ...this.data.teachers[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.data.teachers[idx] = updated;
      return updated;
    },
    softDelete: async (id: string) => {
      const idx = this.data.teachers.findIndex(t => t.id === id);
      if (idx === -1) throw new NotFoundError('Teacher', id);
      this.data.teachers[idx].isActive = false;
      this.data.teachers[idx].employmentStatus = 'Deactivated';
      return this.data.teachers[idx];
    }
  };

  // --- INSTRUMENTS ---
  public instruments = {
    findMany: async () => [...this.data.instruments],
    findUnique: async (id: string) => this.data.instruments.find(i => i.id === id) || null
  };

  // --- BRANCHES ---
  public branches = {
    findMany: async () => [...this.data.branches],
    findUnique: async (id: string) => this.data.branches.find(b => b.id === id) || null,
    updateAddress: async (id: string, address: string) => {
      const b = this.data.branches.find(item => item.id === id);
      if (!b) throw new NotFoundError('Branch', id);
      b.address = address;
      return b;
    }
  };

  // --- MEMBERSHIP PLANS ---
  public plans = {
    findMany: async () => [...this.data.plans],
    findUnique: async (id: string) => this.data.plans.find(p => p.id === id) || null,
    create: async (plan: MembershipPlanRecord) => {
      this.data.plans.push(plan);
      return plan;
    },
    update: async (id: string, updates: Partial<MembershipPlanRecord>) => {
      const idx = this.data.plans.findIndex(p => p.id === id);
      if (idx === -1) throw new NotFoundError('MembershipPlan', id);
      this.data.plans[idx] = { ...this.data.plans[idx], ...updates };
      return this.data.plans[idx];
    }
  };

  // --- MEMBERSHIPS ---
  public memberships = {
    findMany: async (filter?: { memberId?: string; status?: MembershipStatus }) => {
      return this.data.memberships.filter(m => {
        if (filter?.memberId && m.memberId !== filter.memberId) return false;
        if (filter?.status && m.status !== filter.status) return false;
        return true;
      });
    },
    findUnique: async (id: string) => this.data.memberships.find(m => m.id === id) || null,
    create: async (membership: Omit<MembershipRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const record: MembershipRecord = {
        ...membership,
        id: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.memberships.push(record);
      return record;
    },
    update: async (id: string, updates: Partial<MembershipRecord>) => {
      const idx = this.data.memberships.findIndex(m => m.id === id);
      if (idx === -1) throw new NotFoundError('Membership', id);
      const updated = {
        ...this.data.memberships[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.data.memberships[idx] = updated;
      return updated;
    }
  };

  // --- BOOKINGS & CONCURRENCY CONSTRAINTS ---
  public bookings = {
    findMany: async (filter?: { memberId?: string; branchId?: string; classDate?: string; status?: BookingStatus }) => {
      return this.data.bookings.filter(b => {
        if (filter?.memberId && b.memberId !== filter.memberId) return false;
        if (filter?.branchId && b.branchId !== filter.branchId) return false;
        if (filter?.classDate && b.classDate !== filter.classDate) return false;
        if (filter?.status && b.status !== filter.status) return false;
        return true;
      });
    },
    findUnique: async (id: string) => this.data.bookings.find(b => b.id === id) || null,
    create: async (booking: Omit<BookingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      // 1. Strict Concurrency Check: Same Member at Same Date & Slot
      const existingMemberBooking = this.data.bookings.find(
        b => b.memberId === booking.memberId &&
             b.classDate === booking.classDate &&
             b.slotId === booking.slotId &&
             b.status !== 'CANCELLED'
      );
      if (existingMemberBooking) {
        throw new ConflictError(
          `Member '${booking.memberId}' already has an active booking (${existingMemberBooking.id}) for date ${booking.classDate} at Slot #${booking.slotId}`
        );
      }

      // 2. Strict Concurrency Check: Same Teacher at Same Date & Slot
      if (booking.teacherId) {
        const existingTeacherBooking = this.data.bookings.find(
          b => b.teacherId === booking.teacherId &&
               b.classDate === booking.classDate &&
               b.slotId === booking.slotId &&
               b.status !== 'CANCELLED'
        );
        if (existingTeacherBooking) {
          throw new ConflictError(
            `Faculty mentor '${booking.teacherId}' is already assigned to class ${existingTeacherBooking.id} at this date and slot`
          );
        }
      }

      // 3. Strict Concurrency Check: Room / Studio capacity
      const existingRoomBooking = this.data.bookings.find(
        b => b.branchId === booking.branchId &&
             b.roomNumber === booking.roomNumber &&
             b.classDate === booking.classDate &&
             b.slotId === booking.slotId &&
             b.status !== 'CANCELLED'
      );
      if (existingRoomBooking) {
        throw new ConflictError(
          `Studio room ${booking.roomNumber} at branch '${booking.branchId}' is already occupied at Slot #${booking.slotId}`
        );
      }

      const now = new Date().toISOString();
      const record: BookingRecord = {
        ...booking,
        id: `APD-BKG-${Math.floor(8000 + Math.random() * 1999)}`,
        createdAt: now,
        updatedAt: now
      };
      this.data.bookings.push(record);
      return record;
    },
    update: async (id: string, updates: Partial<BookingRecord>) => {
      const idx = this.data.bookings.findIndex(b => b.id === id);
      if (idx === -1) throw new NotFoundError('Booking', id);

      // If rescheduling, check for collisions
      if (updates.classDate || updates.slotId) {
        const targetDate = updates.classDate || this.data.bookings[idx].classDate;
        const targetSlot = updates.slotId || this.data.bookings[idx].slotId;
        const memberId = this.data.bookings[idx].memberId;

        const collision = this.data.bookings.find(
          b => b.id !== id &&
               b.memberId === memberId &&
               b.classDate === targetDate &&
               b.slotId === targetSlot &&
               b.status !== 'CANCELLED'
        );
        if (collision) {
          throw new ConflictError(`Rescheduling failed: Member already has booking ${collision.id} on ${targetDate} at slot #${targetSlot}`);
        }
      }

      const updated = {
        ...this.data.bookings[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.data.bookings[idx] = updated;
      return updated;
    }
  };

  // --- PAYMENTS ---
  public payments = {
    findMany: async (filter?: { memberId?: string; branchId?: string; status?: PaymentStatus }) => {
      return this.data.payments.filter(p => {
        if (filter?.memberId && p.memberId !== filter.memberId) return false;
        if (filter?.branchId && p.branchId !== filter.branchId) return false;
        if (filter?.status && p.status !== filter.status) return false;
        return true;
      });
    },
    findUnique: async (id: string) => this.data.payments.find(p => p.id === id) || null,
    create: async (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
      const now = new Date().toISOString();
      const record: PaymentRecord = {
        ...payment,
        id: `RCPT-${Math.floor(9000 + Math.random() * 999)}`,
        createdAt: now
      };
      this.data.payments.push(record);
      return record;
    },
    update: async (id: string, updates: Partial<PaymentRecord>) => {
      const idx = this.data.payments.findIndex(p => p.id === id);
      if (idx === -1) throw new NotFoundError('Payment', id);
      this.data.payments[idx] = { ...this.data.payments[idx], ...updates };
      return this.data.payments[idx];
    }
  };

  // --- EXPENSES ---
  public expenses = {
    findMany: async (filter?: { branchId?: string; category?: ExpenseCategory }) => {
      return this.data.expenses.filter(e => {
        if (filter?.branchId && e.branchId !== filter.branchId) return false;
        if (filter?.category && e.category !== filter.category) return false;
        return true;
      });
    },
    findUnique: async (id: string) => this.data.expenses.find(e => e.id === id) || null,
    create: async (expense: Omit<ExpenseRecord, 'id' | 'createdAt'>) => {
      const now = new Date().toISOString();
      const record: ExpenseRecord = {
        ...expense,
        id: `EXP-${Math.floor(400 + Math.random() * 599)}`,
        createdAt: now
      };
      this.data.expenses.push(record);
      return record;
    }
  };

  // --- ROOMS ---
  public rooms = {
    findMany: async (filter?: { branchId?: string }) => {
      return this.data.rooms.filter(r => !filter?.branchId || r.branchId === filter.branchId);
    },
    findUnique: async (id: string) => this.data.rooms.find(r => r.id === id) || null
  };

  // --- CLASS SLOTS ---
  public classSlots = {
    findMany: async () => this.data.classSlots,
    findUnique: async (id: number) => this.data.classSlots.find(s => s.id === id) || null
  };

  // --- REFUNDS ---
  public refunds = {
    findMany: async (filter?: { paymentId?: string }) => {
      return this.data.refunds.filter(r => !filter?.paymentId || r.paymentId === filter.paymentId);
    },
    create: async (refund: Omit<RefundRecord, 'id' | 'createdAt'>) => {
      const record: RefundRecord = {
        ...refund,
        id: `RFND-${Math.floor(500 + Math.random() * 499)}`,
        createdAt: new Date().toISOString()
      };
      this.data.refunds.push(record);
      return record;
    }
  };

  // --- NOTIFICATIONS ---
  public notifications = {
    findMany: async (userId: string) => this.data.notifications.filter(n => n.userId === userId),
    create: async (notif: Omit<NotificationRecord, 'id' | 'createdAt'>) => {
      const record: NotificationRecord = {
        ...notif,
        id: `NOTIF-${Math.floor(1000 + Math.random() * 8999)}`,
        createdAt: new Date().toISOString()
      };
      this.data.notifications.push(record);
      return record;
    },
    markAsRead: async (id: string) => {
      const n = this.data.notifications.find(item => item.id === id);
      if (n) n.isRead = true;
      return n || null;
    }
  };

  // --- AUDIT LOGS ---
  public audit = {
    create: async (log: Omit<AuditLogRecord, 'id' | 'createdAt'>) => {
      const record: AuditLogRecord = {
        ...log,
        id: `AUD-${Math.floor(10000 + Math.random() * 89999)}`,
        createdAt: new Date().toISOString()
      };
      this.data.auditLogs.push(record);
      return record;
    },
    findMany: async (entityType?: string, entityId?: string) => {
      return this.data.auditLogs.filter(a => {
        if (entityType && a.entityType !== entityType) return false;
        if (entityId && a.entityId !== entityId) return false;
        return true;
      });
    }
  };

  // Reset database to initial seed for automated tests
  public resetToSeed(): void {
    this.data = getInitialData();
  }
}

export const db = new AcademyDatabase();
