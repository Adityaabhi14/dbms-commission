import {
  Instrument,
  Branch,
  MembershipPlanTier,
  TimeSlot,
  Member,
  Teacher,
  Booking,
  PaymentRecord,
  ExpenseRecord,
  InstrumentId,
  MembershipDuration
} from '../../types';

// 1. INSTRUMENTS (All 7 required instruments)
export const mockInstruments: Instrument[] = [
  {
    id: 'guitar',
    name: 'Guitar',
    category: 'Strings',
    description: 'Master acoustic chords, fingerstyle patterns, and electric guitar solos with customized progression roadmaps.',
    longDescription: 'From intimate acoustic fingerpicking to electrifying rock and jazz lead phrasing, our guitar curriculum covers music theory, fretboard mastery, scales, chord voicings, and live stage dynamics.',
    startingPricePerMonth: 3200,
    availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🎸',
    popularFor: ['Acoustic Fingerstyle', 'Rock Solos', 'Songwriting', 'Rhythm Chords']
  },
  {
    id: 'piano',
    name: 'Piano',
    category: 'Strings', // Keyboard/percussive string
    description: 'Develop two-hand coordination, dynamic phrasing, classical sight-reading, and contemporary keyboard mastery.',
    longDescription: 'Train on acoustic grands and weighted digital workstations. Master posture, finger dexterity, classical repertoire, chord progressions, sight-reading, and contemporary improvisation.',
    startingPricePerMonth: 4000,
    availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🎹',
    popularFor: ['Classical Etudes', 'Jazz Voicings', 'Pop Accompaniment', 'Film Scoring']
  },
  {
    id: 'drums',
    name: 'Drums',
    category: 'Percussion',
    description: 'Build precise limb independence, rhythm lock, groove control, and high-energy fills on acoustic drum kits.',
    longDescription: 'Step into sound-isolated acoustic percussion studios. Learn sticking rudiments, tempo locking with click tracks, dynamic accents, polyrhythms, and high-octane fills across multiple genres.',
    startingPricePerMonth: 3800,
    availableBranches: ['madhapur', 'kokila'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🥁',
    popularFor: ['Limb Independence', 'Funk & Rock Beats', 'Odd Time Signatures', 'Live Band Lock']
  },
  {
    id: 'sitar',
    name: 'Sitar',
    category: 'Indian Classical',
    description: 'Immerse yourself in authentic Indian Classical music, Raag theory, Meend, Taans, and traditional Alaap.',
    longDescription: 'Explore the transcendental acoustics of the traditional sitar under renowned Ustads and Gurus. Learn proper sitting posture, mizrab picking techniques, melodic embellishments, and rhythmic improvisation in Teental and Jhaptal.',
    startingPricePerMonth: 3500,
    availableBranches: ['kokila', 'himayatnagar'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🪕',
    popularFor: ['Raag Yaman & Bhairav', 'Meend & Gamak', 'Taal Mastery', 'Classical Recitals']
  },
  {
    id: 'violin',
    name: 'Violin',
    category: 'Strings',
    description: 'Refine delicate bow stroke dynamics, pure microtonal intonation, and expressive vibrato in Western or Carnatic styles.',
    longDescription: 'Master the delicate art of fretless intonation. Our specialized faculty trains students in clean bow contact, arm posture, shift transitions, vibrato mechanics, and chamber ensemble performance.',
    startingPricePerMonth: 3600,
    availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🎻',
    popularFor: ['Western Classical', 'Carnatic Gamakas', 'Chamber Ensembles', 'Sight Reading']
  },
  {
    id: 'ukulele',
    name: 'Ukulele',
    category: 'Strings',
    description: 'The joyful, accessible stringed instrument perfect for swift rhythm chord fluency and expressive vocal backing.',
    longDescription: 'A delightful instrument that offers rapid musical reward while teaching foundational harmony. Learn strumming rhythms, fingerpicking arpeggios, chord melody arrangements, and vocal accompaniment.',
    startingPricePerMonth: 2600,
    availableBranches: ['madhapur', 'kokila', 'himayatnagar'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🪗',
    popularFor: ['Quick Starter Track', 'Indie & Pop Covers', 'Fingerstyle Strumming', 'Vocal Duets']
  },
  {
    id: 'trumpet',
    name: 'Trumpet',
    category: 'Wind',
    description: 'Command resonant brass acoustics with proper lip embouchure, breath compression, and soaring dynamic power.',
    longDescription: 'Learn trumpet acoustics in treated rehearsal halls. Master diaphragmatic breath support, buzz and embouchure control, valve dexterity, fanfare articulation, and jazz solo improvisation.',
    startingPricePerMonth: 3900,
    availableBranches: ['madhapur', 'kokila'],
    skillLevels: ['Beginner', 'Intermediate', 'Advanced'],
    imagePlaceholder: '🎺',
    popularFor: ['Brass Band Fundamentals', 'Jazz Improvisation', 'Breath Dynamics', 'High Register Control']
  }
];

// 2. STUDIO BRANCHES (Exact names & configurable availability)
export const mockBranches: Branch[] = [
  {
    id: 'madhapur',
    name: 'Madhapur',
    city: 'Hyderabad',
    area: 'Hitec City Core',
    address: 'Plot 42, 3rd Floor, Westline Hub, Near Inorbit Mall & Hitec City Metro, Madhapur, Hyderabad, Telangana 500081',
    phone: '+91 40 2980 4421',
    email: 'madhapur@apdmusicclass.com',
    availableInstruments: ['guitar', 'piano', 'drums', 'violin', 'ukulele', 'trumpet'],
    dailyClassHours: '8:00 AM - 6:00 PM',
    classSlotsCount: 10,
    amenities: ['Acoustic Soundproofing', 'Drum Pods', 'Lounge & Cafe', 'Metro Proximity', 'Parking'],
    imagePlaceholder: '🏢',
    activeStudentsCount: 68
  },
  {
    id: 'kokila',
    name: 'Kokila',
    city: 'Hyderabad',
    area: 'Financial District Campus',
    address: 'Kokila Academy Pavilion, Symphony Block, Opp. SEZ Boulevard, Kokapet Road, Hyderabad, Telangana 500075',
    phone: '+91 40 4821 7733',
    email: 'kokila@apdmusicclass.com',
    availableInstruments: ['guitar', 'piano', 'drums', 'sitar', 'violin', 'ukulele', 'trumpet'], // All 7
    dailyClassHours: '8:00 AM - 6:00 PM',
    classSlotsCount: 10,
    amenities: ['Flagship Auditorium', 'Grand Piano Suite', 'Sitar Hall', 'Recital Amphitheater', 'Recording Studio'],
    imagePlaceholder: '🏛️',
    activeStudentsCount: 92
  },
  {
    id: 'himayatnagar',
    name: 'Himayatnagar',
    city: 'Hyderabad',
    area: 'Central Heritage Studio',
    address: 'Liberty Tower, 2nd Floor, Above Heritage Bank, Liberty Junction, Himayatnagar, Hyderabad, Telangana 500029',
    phone: '+91 40 2322 1890',
    email: 'himayatnagar@apdmusicclass.com',
    availableInstruments: ['guitar', 'piano', 'sitar', 'violin', 'ukulele'],
    dailyClassHours: '8:00 AM - 6:00 PM',
    classSlotsCount: 10,
    amenities: ['Classical Chamber', 'Warm Wood Acoustics', 'Library of Scores', 'Central City Access'],
    imagePlaceholder: '🏡',
    activeStudentsCount: 54
  }
];

// 3. MEMBERSHIP PLANS
export const mockMembershipPlans: MembershipPlanTier[] = [
  {
    id: '1-month',
    months: 1,
    title: '1 Month Explorer',
    description: 'Perfect for beginners testing their rhythm and building fundamental habit.',
    discountPercentage: 0,
    features: [
      '8 Personalized 1-on-1 Studio Sessions',
      'Dedicated Studio Instrument Access',
      'Individual Practice Log Tracking',
      'Flexible Slot Rescheduling (24h notice)'
    ]
  },
  {
    id: '3-months',
    months: 3,
    title: '3 Months Foundation',
    description: 'Our most popular milestone to build solid technique and muscle memory.',
    discountPercentage: 8,
    badge: 'Popular',
    features: [
      '24 Comprehensive Studio Sessions',
      'Mid-Term Assessment & Progress Report',
      'Free Studio Jam Room Booking (2 hrs/mo)',
      'Free Sheet Music & Method Books',
      'Priority Weekend Slot Reservation'
    ]
  },
  {
    id: '6-months',
    months: 6,
    title: '6 Months Mastery',
    description: 'Designed for serious students aiming for stage recitals and advanced repertoire.',
    discountPercentage: 15,
    badge: 'Recommended',
    features: [
      '48 Guided Masterclass Sessions',
      'Guaranteed Academy Stage Recital Slot',
      'Quarterly Ensemble Workshops',
      'Complimentary Instrument Tuning & Care',
      'Free Studio Jam Room Booking (5 hrs/mo)',
      '15% Tuition Savings'
    ]
  },
  {
    id: '12-months',
    months: 12,
    title: '12 Months Artist Academy',
    description: 'Comprehensive year-long music mentorship with certification and recording opportunities.',
    discountPercentage: 25,
    badge: 'Best Value',
    features: [
      '96 Professional Training Sessions',
      'Studio Demo Track Audio Recording',
      'Certified Grade Examination Preparation',
      'All-Branch Studio Access Privileges',
      'Unlimited Rehearsal Suite Access',
      'Maximum 25% Annual Tuition Savings'
    ]
  }
];

// 4. TEN CONSECUTIVE ONE-HOUR SLOTS (8:00 AM to 6:00 PM)
export const mockTimeSlots: TimeSlot[] = [
  { id: 1, label: '8:00 AM–9:00 AM', startTime: '08:00', endTime: '09:00' },
  { id: 2, label: '9:00 AM–10:00 AM', startTime: '09:00', endTime: '10:00' },
  { id: 3, label: '10:00 AM–11:00 AM', startTime: '10:00', endTime: '11:00' },
  { id: 4, label: '11:00 AM–12:00 PM', startTime: '11:00', endTime: '12:00' },
  { id: 5, label: '12:00 PM–1:00 PM', startTime: '12:00', endTime: '13:00' },
  { id: 6, label: '1:00 PM–2:00 PM', startTime: '13:00', endTime: '14:00' },
  { id: 7, label: '2:00 PM–3:00 PM', startTime: '14:00', endTime: '15:00' },
  { id: 8, label: '3:00 PM–4:00 PM', startTime: '15:00', endTime: '16:00' },
  { id: 9, label: '4:00 PM–5:00 PM', startTime: '16:00', endTime: '17:00' },
  { id: 10, label: '5:00 PM–6:00 PM', startTime: '17:00', endTime: '18:00' }
];

// Helper to calculate price centrally
export function calculateMembershipPrice(instrumentId: InstrumentId, durationId: MembershipDuration) {
  const instrument = mockInstruments.find(i => i.id === instrumentId) || mockInstruments[0];
  const plan = mockMembershipPlans.find(p => p.id === durationId) || mockMembershipPlans[0];
  
  const rawSubtotal = instrument.startingPricePerMonth * plan.months;
  const discountAmount = Math.round(rawSubtotal * (plan.discountPercentage / 100));
  const finalPrice = rawSubtotal - discountAmount;

  return {
    baseRatePerMonth: instrument.startingPricePerMonth,
    months: plan.months,
    rawSubtotal,
    discountPercentage: plan.discountPercentage,
    discountAmount,
    finalPrice
  };
}

// 5. DEMONSTRATION MEMBERS (Dates set relative to today for dynamic days calculation)
const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const addDays = (d: Date, days: number) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
};

export const mockMembers: Member[] = [
  {
    id: 'APD-M-1001',
    name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+91 98765 43210',
    enrolledInstrumentId: 'piano',
    branchId: 'kokila',
    planDuration: '6-months',
    startDate: formatDate(addDays(today, -60)),
    expiryDate: formatDate(addDays(today, 120)), // 120 days remaining
    status: 'Active',
    notes: 'Grade 3 Trinity candidate. Focuses on Chopin Nocturnes.',
    emergencyContact: '+91 98765 43219 (Mother)',
    totalClassesAttended: 16
  },
  {
    id: 'APD-M-1002',
    name: 'Sanya Reddy',
    email: 'sanya.reddy@example.com',
    phone: '+91 98490 11223',
    enrolledInstrumentId: 'guitar',
    branchId: 'madhapur',
    planDuration: '3-months',
    startDate: formatDate(addDays(today, -80)),
    expiryDate: formatDate(addDays(today, 10)), // 10 days remaining (Expiring Soon!)
    status: 'Expiring Soon',
    notes: 'Fingerstyle enthusiast. Learning John Mayer acoustic riffs.',
    emergencyContact: '+91 98490 99887 (Father)',
    totalClassesAttended: 22
  },
  {
    id: 'APD-M-1003',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@example.com',
    phone: '+91 99234 56781',
    enrolledInstrumentId: 'drums',
    branchId: 'madhapur',
    planDuration: '12-months',
    startDate: formatDate(addDays(today, -150)),
    expiryDate: formatDate(addDays(today, 215)),
    status: 'Active',
    notes: 'Drummer in local college band. Working on Latin grooves and tempo stability.',
    totalClassesAttended: 42
  },
  {
    id: 'APD-M-1004',
    name: 'Ananya Sharma',
    email: 'ananya.s@example.com',
    phone: '+91 97654 32109',
    enrolledInstrumentId: 'sitar',
    branchId: 'kokila',
    planDuration: '6-months',
    startDate: formatDate(addDays(today, -45)),
    expiryDate: formatDate(addDays(today, 135)),
    status: 'Active',
    notes: 'Mastering Raag Yaman alaap and teental bandish.',
    totalClassesAttended: 12
  },
  {
    id: 'APD-M-1005',
    name: 'Vikram Joshi',
    email: 'vikram.j@example.com',
    phone: '+91 98112 33445',
    enrolledInstrumentId: 'violin',
    branchId: 'himayatnagar',
    planDuration: '1-month',
    startDate: formatDate(addDays(today, -26)),
    expiryDate: formatDate(addDays(today, 4)), // 4 days remaining (Critical Expiring!)
    status: 'Expiring Soon',
    notes: 'Western classical Suzuki method, Book 2.',
    totalClassesAttended: 7
  },
  {
    id: 'APD-M-1006',
    name: 'Pooja Venkatesh',
    email: 'pooja.v@example.com',
    phone: '+91 99401 22334',
    enrolledInstrumentId: 'ukulele',
    branchId: 'himayatnagar',
    planDuration: '3-months',
    startDate: formatDate(addDays(today, -100)),
    expiryDate: formatDate(addDays(today, -10)), // Expired 10 days ago
    status: 'Expired',
    notes: 'Completed indie pop repertoire. Needs renewal callback.',
    totalClassesAttended: 24
  },
  {
    id: 'APD-M-1007',
    name: 'Kabir Malhotra',
    email: 'kabir.m@example.com',
    phone: '+91 97110 88990',
    enrolledInstrumentId: 'trumpet',
    branchId: 'kokila',
    planDuration: '6-months',
    startDate: formatDate(addDays(today, -30)),
    expiryDate: formatDate(addDays(today, 150)),
    status: 'Active',
    notes: 'Practicing Miles Davis modal scales and breath posture.',
    totalClassesAttended: 8
  },
  {
    id: 'APD-M-1008',
    name: 'Meera Nambiar',
    email: 'meera.n@example.com',
    phone: '+91 98840 55667',
    enrolledInstrumentId: 'piano',
    branchId: 'madhapur',
    planDuration: '12-months',
    startDate: formatDate(addDays(today, -200)),
    expiryDate: formatDate(addDays(today, 165)),
    status: 'Active',
    notes: 'Advanced classical repertoire, Beethoven Sonatas.',
    totalClassesAttended: 52
  },
  {
    id: 'APD-M-1009',
    name: 'Devansh Kulkarni',
    email: 'devansh.k@example.com',
    phone: '+91 94220 99881',
    enrolledInstrumentId: 'guitar',
    branchId: 'kokila',
    planDuration: '3-months',
    startDate: formatDate(addDays(today, -15)),
    expiryDate: formatDate(addDays(today, 75)),
    status: 'Active',
    notes: 'Electric guitar blues pentatonics and bends.',
    totalClassesAttended: 4
  },
  {
    id: 'APD-M-1010',
    name: 'Tanvi Agarwal',
    email: 'tanvi.a@example.com',
    phone: '+91 93450 66778',
    enrolledInstrumentId: 'drums',
    branchId: 'kokila',
    planDuration: '1-month',
    startDate: formatDate(addDays(today, -35)),
    expiryDate: formatDate(addDays(today, -5)),
    status: 'Expired',
    notes: 'Travelled abroad; requested temporary pause.',
    totalClassesAttended: 8
  },
  {
    id: 'APD-M-1011',
    name: 'Karthik Subbaram',
    email: 'karthik.s@example.com',
    phone: '+91 98450 12345',
    enrolledInstrumentId: 'violin',
    branchId: 'kokila',
    planDuration: '6-months',
    startDate: formatDate(addDays(today, -10)),
    expiryDate: formatDate(addDays(today, 170)),
    status: 'Active',
    notes: 'Carnatic violin gamakas and geethams.',
    totalClassesAttended: 3
  },
  {
    id: 'APD-M-1012',
    name: 'Ishaan Sen',
    email: 'ishaan.sen@example.com',
    phone: '+91 97330 45678',
    enrolledInstrumentId: 'sitar',
    branchId: 'himayatnagar',
    planDuration: '12-months',
    startDate: formatDate(addDays(today, -90)),
    expiryDate: formatDate(addDays(today, 275)),
    status: 'Active',
    notes: 'Rigorous riyaaz in morning slot. High commitment.',
    totalClassesAttended: 26
  }
];

// 6. DEMONSTRATION TEACHERS (Teaching multiple instruments & assigned to multiple branches)
export const mockTeachers: Teacher[] = [
  {
    id: 'APD-T-201',
    name: 'David Christopher',
    email: 'david.c@apdmusicclass.com',
    phone: '+91 98200 11445',
    instrumentsTaught: ['guitar', 'ukulele'],
    assignedBranches: ['madhapur', 'kokila'],
    availability: 'Full Time',
    employmentStatus: 'Active',
    joiningDate: '2022-04-15',
    bio: 'Berklee-trained guitarist and multi-instrumentalist with 14 years of live performance and academy teaching experience.',
    rating: 4.9
  },
  {
    id: 'APD-T-202',
    name: 'Nandini Swaminathan',
    email: 'nandini.s@apdmusicclass.com',
    phone: '+91 98410 77889',
    instrumentsTaught: ['piano', 'violin'],
    assignedBranches: ['kokila', 'himayatnagar'],
    availability: 'Full Time',
    employmentStatus: 'Active',
    joiningDate: '2021-08-01',
    bio: 'Trinity College London Fellow (FTCL). Concert pianist and classical violinist mentoring award-winning youth performers.',
    rating: 5.0
  },
  {
    id: 'APD-T-203',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@apdmusicclass.com',
    phone: '+91 98860 33221',
    instrumentsTaught: ['drums'],
    assignedBranches: ['madhapur', 'kokila'],
    availability: 'Full Time',
    employmentStatus: 'Active',
    joiningDate: '2023-01-10',
    bio: 'Session drummer for indie rock collectives and jazz fusion trios. Specialist in polyrhythms and studio pocket grooves.',
    rating: 4.8
  },
  {
    id: 'APD-T-204',
    name: 'Pandit Someshwar Banerjee',
    email: 'someshwar.b@apdmusicclass.com',
    phone: '+91 97480 66554',
    instrumentsTaught: ['sitar'],
    assignedBranches: ['kokila', 'himayatnagar'],
    availability: 'Part Time',
    employmentStatus: 'Active',
    joiningDate: '2021-02-15',
    bio: 'Maihar Gharana disciple with 25 years of riyaaz. Renowned for soul-stirring Alaap and microtonal Meend artistry.',
    rating: 5.0
  },
  {
    id: 'APD-T-205',
    name: 'Marcus Anthony',
    email: 'marcus.a@apdmusicclass.com',
    phone: '+91 99000 22119',
    instrumentsTaught: ['trumpet'],
    assignedBranches: ['madhapur', 'kokila'],
    availability: 'Part Time',
    employmentStatus: 'Active',
    joiningDate: '2023-06-20',
    bio: 'Former military symphony lead trumpet player and brass pedagogue focusing on lung capacity and resonant tone production.',
    rating: 4.9
  },
  {
    id: 'APD-T-206',
    name: 'Aishwarya Varma',
    email: 'aishwarya.v@apdmusicclass.com',
    phone: '+91 98190 44332',
    instrumentsTaught: ['guitar', 'piano'],
    assignedBranches: ['himayatnagar'],
    availability: 'Weekend Specialist',
    employmentStatus: 'Active',
    joiningDate: '2024-03-01',
    bio: 'Contemporary pop arranger and theory tutor guiding young musicians in vocal harmony and songwriting accompaniment.',
    rating: 4.7
  }
];

// 7. DEMONSTRATION BOOKINGS & UPCOMING CLASSES
export const mockBookings: Booking[] = [
  {
    id: 'APD-BKG-8801',
    memberId: 'APD-M-1001',
    memberName: 'Aarav Patel',
    memberEmail: 'aarav.patel@example.com',
    instrumentId: 'piano',
    branchId: 'kokila',
    planDuration: '6-months',
    bookingDate: '2026-08-20',
    firstClassDate: formatDate(addDays(today, 1)),
    slotId: 3,
    slotLabel: '10:00 AM–11:00 AM',
    baseFee: 24000,
    discountAmount: 3600,
    totalPayable: 20400,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMode: 'UPI'
  },
  {
    id: 'APD-BKG-8802',
    memberId: 'APD-M-1002',
    memberName: 'Sanya Reddy',
    memberEmail: 'sanya.reddy@example.com',
    instrumentId: 'guitar',
    branchId: 'madhapur',
    planDuration: '3-months',
    bookingDate: '2026-07-30',
    firstClassDate: formatDate(addDays(today, 2)),
    slotId: 7,
    slotLabel: '2:00 PM–3:00 PM',
    baseFee: 9600,
    discountAmount: 768,
    totalPayable: 8832,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMode: 'Card'
  },
  {
    id: 'APD-BKG-8803',
    memberId: 'APD-M-1003',
    memberName: 'Rohan Deshmukh',
    memberEmail: 'rohan.d@example.com',
    instrumentId: 'drums',
    branchId: 'madhapur',
    planDuration: '12-months',
    bookingDate: '2026-05-18',
    firstClassDate: formatDate(addDays(today, 3)),
    slotId: 9,
    slotLabel: '4:00 PM–5:00 PM',
    baseFee: 45600,
    discountAmount: 11400,
    totalPayable: 34200,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMode: 'Net Banking'
  },
  {
    id: 'APD-BKG-8804',
    memberId: 'APD-M-1001',
    memberName: 'Aarav Patel',
    memberEmail: 'aarav.patel@example.com',
    instrumentId: 'piano',
    branchId: 'kokila',
    planDuration: '6-months',
    bookingDate: '2026-09-01',
    firstClassDate: formatDate(addDays(today, 5)),
    slotId: 3,
    slotLabel: '10:00 AM–11:00 AM',
    baseFee: 24000,
    discountAmount: 3600,
    totalPayable: 20400,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    paymentMode: 'UPI'
  }
];

// 8. DEMONSTRATION PAYMENTS
export const mockPayments: PaymentRecord[] = [
  {
    id: 'RCPT-9041',
    bookingId: 'APD-BKG-8801',
    memberName: 'Aarav Patel',
    memberEmail: 'aarav.patel@example.com',
    amount: 20400,
    date: '2026-08-20',
    method: 'UPI',
    status: 'Collected',
    instrumentId: 'piano',
    branchId: 'kokila'
  },
  {
    id: 'RCPT-9042',
    bookingId: 'APD-BKG-8802',
    memberName: 'Sanya Reddy',
    memberEmail: 'sanya.reddy@example.com',
    amount: 8832,
    date: '2026-07-30',
    method: 'Card',
    status: 'Collected',
    instrumentId: 'guitar',
    branchId: 'madhapur'
  },
  {
    id: 'RCPT-9043',
    bookingId: 'APD-BKG-8803',
    memberName: 'Rohan Deshmukh',
    memberEmail: 'rohan.d@example.com',
    amount: 34200,
    date: '2026-05-18',
    method: 'Net Banking',
    status: 'Collected',
    instrumentId: 'drums',
    branchId: 'madhapur'
  },
  {
    id: 'RCPT-9044',
    bookingId: 'APD-BKG-8807',
    memberName: 'Kabir Malhotra',
    memberEmail: 'kabir.m@example.com',
    amount: 19890,
    date: '2026-09-19',
    method: 'UPI',
    status: 'Collected',
    instrumentId: 'trumpet',
    branchId: 'kokila'
  },
  {
    id: 'RCPT-9045',
    bookingId: 'APD-BKG-8805',
    memberName: 'Vikram Joshi',
    memberEmail: 'vikram.j@example.com',
    amount: 3600,
    date: '2026-09-22',
    method: 'Card',
    status: 'Collected',
    instrumentId: 'violin',
    branchId: 'himayatnagar'
  },
  {
    id: 'RCPT-9046',
    bookingId: 'APD-BKG-8806',
    memberName: 'Pooja Venkatesh',
    memberEmail: 'pooja.v@example.com',
    amount: 7176,
    date: '2026-07-10',
    method: 'UPI',
    status: 'Collected',
    instrumentId: 'ukulele',
    branchId: 'himayatnagar'
  },
  {
    id: 'RCPT-9047',
    bookingId: 'APD-BKG-8812',
    memberName: 'Ishaan Sen',
    memberEmail: 'ishaan.sen@example.com',
    amount: 31500,
    date: '2026-07-19',
    method: 'Net Banking',
    status: 'Collected',
    instrumentId: 'sitar',
    branchId: 'himayatnagar'
  },
  {
    id: 'RCPT-9048',
    bookingId: 'APD-BKG-8899',
    memberName: 'Priya Narang',
    memberEmail: 'priya.n@example.com',
    amount: 8832,
    date: '2026-09-12',
    method: 'UPI',
    status: 'Pending',
    instrumentId: 'guitar',
    branchId: 'madhapur'
  },
  {
    id: 'RCPT-9049',
    bookingId: 'APD-BKG-8888',
    memberName: 'Anand Verma',
    memberEmail: 'anand.v@example.com',
    amount: 4000,
    date: '2026-08-15',
    method: 'Card',
    status: 'Refunded',
    instrumentId: 'piano',
    branchId: 'kokila'
  }
];

// 9. OPERATING EXPENSES
export const mockExpenses: ExpenseRecord[] = [
  {
    id: 'EXP-401',
    title: 'Madhapur Studio Lease (Monthly)',
    category: 'Studio Rent',
    branchId: 'madhapur',
    amount: 110000,
    date: '2026-10-01',
    vendorOrRecipient: 'Westline Properties LLP',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-402',
    title: 'Kokila Flagship Pavilion Lease (Monthly)',
    category: 'Studio Rent',
    branchId: 'kokila',
    amount: 165000,
    date: '2026-10-01',
    vendorOrRecipient: 'Symphony Commercial Estates',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-403',
    title: 'Himayatnagar Liberty Floor Rent',
    category: 'Studio Rent',
    branchId: 'himayatnagar',
    amount: 85000,
    date: '2026-10-01',
    vendorOrRecipient: 'Liberty Real Estate Trust',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-404',
    title: 'Senior Faculty Compensation - David Christopher',
    category: 'Teacher Compensation',
    branchId: 'madhapur',
    amount: 62000,
    date: '2026-10-05',
    vendorOrRecipient: 'David Christopher',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-405',
    title: 'Senior Faculty Compensation - Nandini Swaminathan',
    category: 'Teacher Compensation',
    branchId: 'kokila',
    amount: 70000,
    date: '2026-10-05',
    vendorOrRecipient: 'Nandini Swaminathan',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-406',
    title: 'Faculty Compensation - Vikramaditya Rao',
    category: 'Teacher Compensation',
    branchId: 'madhapur',
    amount: 58000,
    date: '2026-10-05',
    vendorOrRecipient: 'Vikramaditya Rao',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-407',
    title: 'Grand Piano Master Tuning & Humidifier Care',
    category: 'Equipment & Maintenance',
    branchId: 'kokila',
    amount: 18500,
    date: '2026-10-08',
    vendorOrRecipient: 'Hyderabad Piano Guild',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-408',
    title: 'Acoustic Soundproofing Panel Refurbishment',
    category: 'Utilities & Acoustic Tech',
    branchId: 'madhapur',
    amount: 24000,
    date: '2026-10-12',
    vendorOrRecipient: 'SonicBaffle Solutions',
    paymentStatus: 'Paid'
  },
  {
    id: 'EXP-409',
    title: 'Autumn Recital Social Media & Print Campaign',
    category: 'Marketing',
    branchId: 'kokila',
    amount: 32000,
    date: '2026-10-14',
    vendorOrRecipient: 'Cadence Creative Media',
    paymentStatus: 'Paid'
  }
];

// 10. CENTRALIZED FINANCIAL SUMMARY METRICS
export function getFinancialSummary() {
  const collectedPayments = mockPayments
    .filter(p => p.status === 'Collected')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = mockPayments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const refunds = mockPayments
    .filter(p => p.status === 'Refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  const grossRevenue = collectedPayments + pendingPayments;
  const recognizedRevenue = collectedPayments;

  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const teacherCompensation = mockExpenses
    .filter(e => e.category === 'Teacher Compensation')
    .reduce((sum, e) => sum + e.amount, 0);
  const operatingExpenses = totalExpenses - teacherCompensation;

  // Formula as required: Net profit = Recognized revenue - Recorded expenses
  const netProfit = recognizedRevenue - totalExpenses;

  // Instrument-wise revenue (from collected payments)
  const revenueByInstrument: Record<InstrumentId, number> = {
    guitar: 0,
    piano: 0,
    drums: 0,
    sitar: 0,
    violin: 0,
    ukulele: 0,
    trumpet: 0
  };

  mockPayments.forEach(p => {
    if (p.status === 'Collected') {
      revenueByInstrument[p.instrumentId] += p.amount;
    }
  });

  // Branch-wise revenue
  const revenueByBranch: Record<string, number> = {
    madhapur: 0,
    kokila: 0,
    himayatnagar: 0
  };

  mockPayments.forEach(p => {
    if (p.status === 'Collected') {
      revenueByBranch[p.branchId] += p.amount;
    }
  });

  // Identify most profitable instrument
  let mostProfitableInstrument: InstrumentId = 'piano';
  let maxInstRev = -1;
  (Object.keys(revenueByInstrument) as InstrumentId[]).forEach(inst => {
    if (revenueByInstrument[inst] > maxInstRev) {
      maxInstRev = revenueByInstrument[inst];
      mostProfitableInstrument = inst;
    }
  });

  // Identify most profitable branch
  let mostProfitableBranch = 'kokila';
  let maxBranchRev = -1;
  Object.keys(revenueByBranch).forEach(b => {
    if (revenueByBranch[b] > maxBranchRev) {
      maxBranchRev = revenueByBranch[b];
      mostProfitableBranch = b;
    }
  });

  return {
    grossRevenue,
    collectedPayments,
    outstandingPayments: pendingPayments,
    refunds,
    recognizedRevenue,
    totalExpenses,
    operatingExpenses,
    teacherCompensation,
    netProfit,
    revenueByInstrument,
    revenueByBranch,
    mostProfitableInstrument,
    mostProfitableBranch
  };
}
