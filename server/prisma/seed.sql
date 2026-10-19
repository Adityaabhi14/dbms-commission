-- ==============================================================================
-- APD MUSIC CLASS — DETERMINISTIC DEVELOPMENT SEED SCRIPT (PHASE 3)
-- All data is explicitly labeled as demonstration / development test data.
-- ==============================================================================

-- 1. SEED CLASS SLOTS (Ten 1-Hour Consecutive Daily Slots 08:00 - 18:00 IST)
INSERT INTO class_slots (id, slot_number, label, start_time, end_time) VALUES
(1, 1, '08:00–09:00', '08:00', '09:00'),
(2, 2, '09:00–10:00', '09:00', '10:00'),
(3, 3, '10:00–11:00', '10:00', '11:00'),
(4, 4, '11:00–12:00', '11:00', '12:00'),
(5, 5, '12:00–13:00', '12:00', '13:00'),
(6, 6, '13:00–14:00', '13:00', '14:00'),
(7, 7, '14:00–15:00', '14:00', '15:00'),
(8, 8, '15:00–16:00', '15:00', '16:00'),
(9, 9, '16:00–17:00', '16:00', '17:00'),
(10, 10, '17:00–18:00', '17:00', '18:00')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED EXPENSE CATEGORIES
INSERT INTO expense_categories (id, name, description, allocation_type) VALUES
('STUDIO_RENT', 'Campus & Studio Lease', 'Physical campus premises lease and property rental', 'BRANCH_OVERHEAD'),
('TEACHER_COMPENSATION', 'Faculty Mentor Payroll', 'Faculty master salaries, hourly class stipends, and guest masterclass fees', 'DIRECT'),
('EQUIPMENT_MAINTENANCE', 'Instrument & Studio Maintenance', 'Piano tuning, guitar restringing, drumhead replacement, amplifier servicing', 'DIRECT'),
('UTILITIES_ACOUSTIC_TECH', 'Acoustic Tech & Studio Utilities', 'High-speed broadband, acoustic climate control, electricity, studio lighting', 'BRANCH_OVERHEAD'),
('MARKETING', 'Brand & Student Admissions', 'Digital music campaign, student recitals, academy brand awareness', 'SHARED'),
('OTHER_OPERATIONAL', 'General Administration', 'Legal compliance, academy software subscriptions, audit fees', 'SHARED')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED 3 HYDERABAD BRANCHES
INSERT INTO branches (id, name, city, area, address, phone, email, daily_class_hours, class_slots_count, is_active) VALUES
('madhapur', 'Madhapur', 'Hyderabad', 'Hitec City Core', 'Plot 42, 3rd Floor, Westline Hub, Near Inorbit Mall & Hitec City Metro, Madhapur, Hyderabad, Telangana 500081', '+91 40 2980 4421', 'madhapur@apdmusicclass.com', '8:00 AM - 6:00 PM', 10, TRUE),
('kokila', 'Kokila', 'Hyderabad', 'Financial District Campus', 'Kokila Academy Pavilion, Symphony Block, Opp. SEZ Boulevard, Kokapet Road, Hyderabad, Telangana 500075', '+91 40 4821 7733', 'kokila@apdmusicclass.com', '8:00 AM - 6:00 PM', 10, TRUE),
('himayatnagar', 'Himayatnagar', 'Hyderabad', 'Central Heritage Studio', 'Liberty Tower, 2nd Floor, Above Heritage Bank, Liberty Junction, Himayatnagar, Hyderabad, Telangana 500029', '+91 40 2322 1890', 'himayatnagar@apdmusicclass.com', '8:00 AM - 6:00 PM', 10, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED 15 ACOUSTIC ROOMS (5 Rooms Per Campus)
INSERT INTO rooms (id, branch_id, room_number, name, acoustic_type, capacity, is_active) VALUES
-- Madhapur Campus Rooms
('a0000001-0000-0000-0000-000000000001', 'madhapur', 1, 'Studio 1 - Grand Piano Suite', 'PIANO_SUITE', 1, TRUE),
('a0000001-0000-0000-0000-000000000002', 'madhapur', 2, 'Studio 2 - Sound Isolation Drum Booth', 'DRUM_ISOLATION_BOOTH', 1, TRUE),
('a0000001-0000-0000-0000-000000000003', 'madhapur', 3, 'Studio 3 - Western Strings Suite', 'STRINGS_STUDIO', 1, TRUE),
('a0000001-0000-0000-0000-000000000004', 'madhapur', 4, 'Studio 4 - Contemporary Guitar Lab', 'STRINGS_STUDIO', 1, TRUE),
('a0000001-0000-0000-0000-000000000005', 'madhapur', 5, 'Studio 5 - Acoustic Ensemble Hall', 'ENSEMBLE_HALL', 4, TRUE),
-- Kokila Campus Rooms
('a0000002-0000-0000-0000-000000000001', 'kokila', 1, 'Studio 1 - Steinway Grand Piano Salon', 'PIANO_SUITE', 1, TRUE),
('a0000002-0000-0000-0000-000000000002', 'kokila', 2, 'Studio 2 - Percussion Sound Isolation Lab', 'DRUM_ISOLATION_BOOTH', 1, TRUE),
('a0000002-0000-0000-0000-000000000003', 'kokila', 3, 'Studio 3 - Indian Classical Raag Chamber', 'INDIAN_CLASSICAL_CHAMBER', 1, TRUE),
('a0000002-0000-0000-0000-000000000004', 'kokila', 4, 'Studio 4 - Acoustic Guitar Suite', 'STRINGS_STUDIO', 1, TRUE),
('a0000002-0000-0000-0000-000000000005', 'kokila', 5, 'Studio 5 - Symphony Masterclass Hall', 'ENSEMBLE_HALL', 4, TRUE),
-- Himayatnagar Campus Rooms
('a0000003-0000-0000-0000-000000000001', 'himayatnagar', 1, 'Studio 1 - Classical Sitar Mehfil', 'INDIAN_CLASSICAL_CHAMBER', 1, TRUE),
('a0000003-0000-0000-0000-000000000002', 'himayatnagar', 2, 'Studio 2 - Upright Piano Room', 'PIANO_SUITE', 1, TRUE),
('a0000003-0000-0000-0000-000000000003', 'himayatnagar', 3, 'Studio 3 - Violin Intonation Studio', 'STRINGS_STUDIO', 1, TRUE),
('a0000003-0000-0000-0000-000000000004', 'himayatnagar', 4, 'Studio 4 - Fingerstyle Guitar Suite', 'STRINGS_STUDIO', 1, TRUE),
('a0000003-0000-0000-0000-000000000005', 'himayatnagar', 5, 'Studio 5 - Chamber Music Recital Room', 'ENSEMBLE_HALL', 4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED 7 INSTRUMENTS
INSERT INTO instruments (id, name, category, description, starting_price_per_month, is_active) VALUES
('guitar', 'Guitar', 'Strings', 'Master acoustic chords, fingerstyle patterns, and electric guitar solos with customized progression roadmaps.', 3200.00, TRUE),
('piano', 'Piano', 'Strings', 'Develop two-hand coordination, dynamic phrasing, classical sight-reading, and contemporary keyboard mastery.', 4000.00, TRUE),
('drums', 'Drums', 'Percussion', 'Build precise limb independence, rhythm lock, groove control, and high-energy fills on acoustic drum kits.', 3800.00, TRUE),
('sitar', 'Sitar', 'Indian Classical', 'Immerse yourself in authentic Indian Classical music, Raag theory, Meend, Taans, and traditional Alaap.', 3500.00, TRUE),
('violin', 'Violin', 'Strings', 'Refine delicate bow stroke dynamics, pure microtonal intonation, and expressive vibrato in Western or Carnatic styles.', 3600.00, TRUE),
('ukulele', 'Ukulele', 'Strings', 'Enjoy rapid melodic progress, strumming patterns, and joyful song repertoire on soprano and concert ukuleles.', 2800.00, TRUE),
('trumpet', 'Trumpet', 'Wind', 'Build diaphragmatic breath control, embouchure stamina, brass resonance, and jazz trumpet improvisation.', 3400.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED BRANCH INSTRUMENT AVAILABILITY
INSERT INTO branch_instruments (branch_id, instrument_id) VALUES
('madhapur', 'guitar'), ('madhapur', 'piano'), ('madhapur', 'drums'), ('madhapur', 'violin'), ('madhapur', 'ukulele'), ('madhapur', 'trumpet'),
('kokila', 'guitar'), ('kokila', 'piano'), ('kokila', 'drums'), ('kokila', 'sitar'), ('kokila', 'violin'), ('kokila', 'ukulele'), ('kokila', 'trumpet'),
('himayatnagar', 'guitar'), ('himayatnagar', 'piano'), ('himayatnagar', 'sitar'), ('himayatnagar', 'violin'), ('himayatnagar', 'ukulele')
ON CONFLICT (branch_id, instrument_id) DO NOTHING;

-- 7. SEED 4 MEMBERSHIP PLANS (1, 3, 6, 12 Months)
INSERT INTO membership_plans (id, duration_months, title, description, discount_percentage, badge, is_active) VALUES
('1-month', 1, '1 Month Explorer', 'Perfect for beginners testing rhythm and building fundamental practice habits.', 0.00, 'EXPLORER', TRUE),
('3-months', 3, '3 Months Performer', 'Our most popular progression track for structured skill development and grade foundations.', 8.00, 'POPULAR', TRUE),
('6-months', 6, '6 Months Virtuoso', 'Deep comprehensive mastery with priority studio slot reservations and masterclass recordings.', 15.00, 'BEST VALUE', TRUE),
('12-months', 12, '12 Months Maestro', 'Full annual fellowship with concert stage performances, diploma exam preparation, and free room practice hours.', 25.00, 'MAX SAVINGS', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. SEED PLAN PRICINGS MATRIX (28 Tiers: 4 Plans x 7 Instruments)
INSERT INTO plan_pricings (id, plan_id, instrument_id, base_rate_per_month, raw_subtotal, discount_amount, final_tuition_fee) VALUES
-- Guitar (3,200/mo)
('c0000001-0000-0000-0000-000000000001', '1-month', 'guitar', 3200.00, 3200.00, 0.00, 3200.00),
('c0000001-0000-0000-0000-000000000002', '3-months', 'guitar', 3200.00, 9600.00, 768.00, 8832.00),
('c0000001-0000-0000-0000-000000000003', '6-months', 'guitar', 3200.00, 19200.00, 2880.00, 16320.00),
('c0000001-0000-0000-0000-000000000004', '12-months', 'guitar', 3200.00, 38400.00, 9600.00, 28800.00),
-- Piano (4,000/mo)
('c0000002-0000-0000-0000-000000000001', '1-month', 'piano', 4000.00, 4000.00, 0.00, 4000.00),
('c0000002-0000-0000-0000-000000000002', '3-months', 'piano', 4000.00, 12000.00, 960.00, 11040.00),
('c0000002-0000-0000-0000-000000000003', '6-months', 'piano', 4000.00, 24000.00, 3600.00, 20400.00),
('c0000002-0000-0000-0000-000000000004', '12-months', 'piano', 4000.00, 48000.00, 12000.00, 36000.00),
-- Drums (3,800/mo)
('c0000003-0000-0000-0000-000000000001', '1-month', 'drums', 3800.00, 3800.00, 0.00, 3800.00),
('c0000003-0000-0000-0000-000000000002', '3-months', 'drums', 3800.00, 11400.00, 912.00, 10488.00),
('c0000003-0000-0000-0000-000000000003', '6-months', 'drums', 3800.00, 22800.00, 3420.00, 19380.00),
('c0000003-0000-0000-0000-000000000004', '12-months', 'drums', 3800.00, 45600.00, 11400.00, 34200.00),
-- Sitar (3,500/mo)
('c0000004-0000-0000-0000-000000000001', '1-month', 'sitar', 3500.00, 3500.00, 0.00, 3500.00),
('c0000004-0000-0000-0000-000000000002', '3-months', 'sitar', 3500.00, 10500.00, 840.00, 9660.00),
('c0000004-0000-0000-0000-000000000003', '6-months', 'sitar', 3500.00, 21000.00, 3150.00, 17850.00),
('c0000004-0000-0000-0000-000000000004', '12-months', 'sitar', 3500.00, 42000.00, 10500.00, 31500.00),
-- Violin (3,600/mo)
('c0000005-0000-0000-0000-000000000001', '1-month', 'violin', 3600.00, 3600.00, 0.00, 3600.00),
('c0000005-0000-0000-0000-000000000002', '3-months', 'violin', 3600.00, 10800.00, 864.00, 9936.00),
('c0000005-0000-0000-0000-000000000003', '6-months', 'violin', 3600.00, 21600.00, 3240.00, 18360.00),
('c0000005-0000-0000-0000-000000000004', '12-months', 'violin', 3600.00, 43200.00, 10800.00, 32400.00),
-- Ukulele (2,800/mo)
('c0000006-0000-0000-0000-000000000001', '1-month', 'ukulele', 2800.00, 2800.00, 0.00, 2800.00),
('c0000006-0000-0000-0000-000000000002', '3-months', 'ukulele', 2800.00, 8400.00, 672.00, 7728.00),
('c0000006-0000-0000-0000-000000000003', '6-months', 'ukulele', 2800.00, 16800.00, 2520.00, 14280.00),
('c0000006-0000-0000-0000-000000000004', '12-months', 'ukulele', 2800.00, 33600.00, 8400.00, 25200.00),
-- Trumpet (3,400/mo)
('c0000007-0000-0000-0000-000000000001', '1-month', 'trumpet', 3400.00, 3400.00, 0.00, 3400.00),
('c0000007-0000-0000-0000-000000000002', '3-months', 'trumpet', 3400.00, 10200.00, 816.00, 9384.00),
('c0000007-0000-0000-0000-000000000003', '6-months', 'trumpet', 3400.00, 20400.00, 3060.00, 17340.00),
('c0000007-0000-0000-0000-000000000004', '12-months', 'trumpet', 3400.00, 40800.00, 10200.00, 30600.00)
ON CONFLICT (plan_id, instrument_id, branch_id) DO NOTHING;

-- 9. SEED USERS (Passwords set to bcrypt hash of 'password123' for demo)
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active) VALUES
('b0000001-0000-0000-0000-000000000001', 'director@apdmusicclass.com', '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e', 'Dr. Alok Prasad', '+91 40 4821 7733', 'OWNER', TRUE),
('b0000001-0000-0000-0000-000000000002', 'aarav.patel@example.com', '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e', 'Aarav Patel', '+91 98765 43210', 'CLIENT', TRUE),
('b0000001-0000-0000-0000-000000000003', 'sanya.reddy@example.com', '$2a$10$wT0X8z5yZ4y1q8oKjZ5fGe6n7z.J4wW2p6g4mK2X5g3f1t0q8u9e', 'Sanya Reddy', '+91 98490 11223', 'CLIENT', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 10. SEED OWNER PROFILE
INSERT INTO owner_profiles (id, user_id, department, access_level) VALUES
('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'Executive Directorate & Board', 'DIRECTOR')
ON CONFLICT (user_id) DO NOTHING;

-- 11. SEED MEMBERS (Student Profiles)
INSERT INTO members (id, user_id, full_name, email, phone, enrolled_instrument_id, branch_id, status, notes, emergency_contact, total_classes_attended) VALUES
('APD-M-1001', 'b0000001-0000-0000-0000-000000000002', 'Aarav Patel', 'aarav.patel@example.com', '+91 98765 43210', 'piano', 'kokila', 'ACTIVE', 'Grade 3 Trinity candidate. Focuses on Chopin Nocturnes.', '+91 98765 43219', 16),
('APD-M-1002', 'b0000001-0000-0000-0000-000000000003', 'Sanya Reddy', 'sanya.reddy@example.com', '+91 98490 11223', 'guitar', 'madhapur', 'EXPIRING_SOON', 'Fingerstyle enthusiast. Learning John Mayer acoustic riffs.', '+91 98490 99887', 22)
ON CONFLICT (id) DO NOTHING;

-- 12. SEED 4 FACULTY TEACHERS
INSERT INTO teachers (id, full_name, email, phone, employment_status, joining_date, bio, rating, is_active) VALUES
('APD-T-201', 'David Christopher', 'david.c@apdmusicclass.com', '+91 98200 11445', 'Active', '2022-04-15', 'Berklee-trained guitarist and multi-instrumentalist with 14 years of live performance and academy teaching experience.', 4.90, TRUE),
('APD-T-202', 'Nandini Swaminathan', 'nandini.s@apdmusicclass.com', '+91 98410 77889', 'Active', '2021-08-01', 'Royal Academy of Music alumna. Specializes in advanced classical piano phrasing, sight-reading, and acoustic violin intonation.', 4.95, TRUE),
('APD-T-203', 'Ustad Rashid Ali', 'rashid.ali@apdmusicclass.com', '+91 98190 33441', 'Active', '2020-01-10', 'Senior disciple of Senia Maihar Gharana with 22 years of Indian Classical concert tours. Masters in Sitar and Raag Vidya.', 5.00, TRUE),
('APD-T-204', 'Vikram Malhotra', 'vikram.m@apdmusicclass.com', '+91 98330 66778', 'Active', '2023-02-01', 'Trinity Guildhall Grade 8 drum specialist. Trains students in rock groove, syncopation, and orchestral brass accompaniment.', 4.85, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 13. SEED TEACHER INSTRUMENT CERTIFICATIONS
INSERT INTO teacher_instruments (teacher_id, instrument_id, is_primary, years_experience) VALUES
('APD-T-201', 'guitar', TRUE, 14), ('APD-T-201', 'ukulele', FALSE, 8),
('APD-T-202', 'piano', TRUE, 16), ('APD-T-202', 'violin', FALSE, 10),
('APD-T-203', 'sitar', TRUE, 22),
('APD-T-204', 'drums', TRUE, 12), ('APD-T-204', 'trumpet', FALSE, 6)
ON CONFLICT (teacher_id, instrument_id) DO NOTHING;

-- 14. SEED TEACHER CAMPUS ASSIGNMENTS
INSERT INTO teacher_branches (teacher_id, branch_id, is_home_branch) VALUES
('APD-T-201', 'madhapur', TRUE), ('APD-T-201', 'kokila', FALSE),
('APD-T-202', 'kokila', TRUE), ('APD-T-202', 'himayatnagar', FALSE),
('APD-T-203', 'kokila', TRUE), ('APD-T-203', 'himayatnagar', FALSE),
('APD-T-204', 'madhapur', TRUE), ('APD-T-204', 'kokila', FALSE)
ON CONFLICT (teacher_id, branch_id) DO NOTHING;

-- 15. SEED MEMBERSHIPS (With Immutable Purchase Snapshot)
INSERT INTO memberships (id, member_id, plan_id, instrument_id, branch_id, start_date, expiry_date, status, payment_status, base_price_snapshot, discount_amount_snapshot, payable_amount_snapshot, plan_title_snapshot) VALUES
('e0000001-0000-0000-0000-000000000001', 'APD-M-1001', '6-months', 'piano', 'kokila', '2026-08-01', '2027-02-01', 'ACTIVE', 'COLLECTED', 24000.00, 3600.00, 20400.00, '6 Months Virtuoso'),
('e0000001-0000-0000-0000-000000000002', 'APD-M-1002', '3-months', 'guitar', 'madhapur', '2026-07-25', '2026-10-25', 'EXPIRING_SOON', 'COLLECTED', 9600.00, 768.00, 8832.00, '3 Months Performer')
ON CONFLICT (id) DO NOTHING;

-- 16. SEED BOOKINGS
INSERT INTO bookings (id, membership_id, member_id, branch_id, room_id, instrument_id, teacher_id, class_date, slot_id, slot_label, status, payment_mode) VALUES
('APD-BKG-8801', 'e0000001-0000-0000-0000-000000000001', 'APD-M-1001', 'kokila', 'a0000002-0000-0000-0000-000000000001', 'piano', 'APD-T-202', '2026-10-25', 3, '10:00–11:00', 'CONFIRMED', 'UPI'),
('APD-BKG-8802', 'e0000001-0000-0000-0000-000000000002', 'APD-M-1002', 'madhapur', 'a0000001-0000-0000-0000-000000000002', 'guitar', 'APD-T-201', '2026-10-26', 7, '14:00–15:00', 'CONFIRMED', 'CARD')
ON CONFLICT (id) DO NOTHING;

-- 17. SEED FINANCIAL PAYMENTS
INSERT INTO payments (id, membership_id, booking_id, member_id, branch_id, instrument_id, amount, refund_amount, method, status, transaction_ref) VALUES
('RCPT-9041', 'e0000001-0000-0000-0000-000000000001', 'APD-BKG-8801', 'APD-M-1001', 'kokila', 'piano', 20400.00, 0.00, 'UPI', 'COLLECTED', 'UPI-TXN-998822'),
('RCPT-9042', 'e0000001-0000-0000-0000-000000000002', 'APD-BKG-8802', 'APD-M-1002', 'madhapur', 'guitar', 8832.00, 0.00, 'CARD', 'COLLECTED', 'CARD-TXN-110293')
ON CONFLICT (id) DO NOTHING;

-- 18. SEED EXPENSES (Operating Ledger)
INSERT INTO expenses (id, title, category_id, branch_id, instrument_id, amount, vendor, date) VALUES
('EXP-401', 'Madhapur Studio Lease (Monthly)', 'STUDIO_RENT', 'madhapur', NULL, 110000.00, 'Westline Commercial Realty', '2026-10-01'),
('EXP-402', 'Kokila Campus Lease (Monthly)', 'STUDIO_RENT', 'kokila', NULL, 95000.00, 'Symphony Estates Pvt Ltd', '2026-10-01'),
('EXP-403', 'Himayatnagar Studio Lease (Monthly)', 'STUDIO_RENT', 'himayatnagar', NULL, 70000.00, 'Heritage Properties Hyderabad', '2026-10-01'),
('EXP-404', 'Faculty Payroll (Guitar & Piano Masters)', 'TEACHER_COMPENSATION', 'madhapur', 'guitar', 72000.00, 'Faculty Compensation Ledger', '2026-10-05'),
('EXP-405', 'Faculty Payroll (Sitar & Classical Voice)', 'TEACHER_COMPENSATION', 'kokila', 'piano', 60000.00, 'Faculty Compensation Ledger', '2026-10-05')
ON CONFLICT (id) DO NOTHING;
