-- ==============================================================================
-- APD MUSIC CLASS — PRODUCTION MIGRATION SCRIPT (PHASE 3)
-- Target RDBMS: PostgreSQL 14+ / 15+ / 16+
-- Schema Version: 20261019000000_production_relational_schema
-- Normalization: 3NF / BCNF
-- ==============================================================================

-- 1. REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENT', 'OWNER', 'STAFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_status AS ENUM (
        'PENDING_PAYMENT',
        'ACTIVE',
        'EXPIRING_SOON',
        'EXPIRED',
        'CANCELLED',
        'SUSPENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'CONFIRMED',
        'COMPLETED',
        'RESCHEDULED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'PENDING',
        'COLLECTED',
        'REFUNDED',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'UPI',
        'CARD',
        'NET_BANKING',
        'CASH'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category_type AS ENUM (
        'STUDIO_RENT',
        'TEACHER_COMPENSATION',
        'EQUIPMENT_MAINTENANCE',
        'UTILITIES_ACOUSTIC_TECH',
        'MARKETING',
        'OTHER_OPERATIONAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE acoustic_room_type AS ENUM (
        'PIANO_SUITE',
        'DRUM_ISOLATION_BOOTH',
        'STRINGS_STUDIO',
        'INDIAN_CLASSICAL_CHAMBER',
        'ENSEMBLE_HALL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'BOOKING_CONFIRMATION',
        'BOOKING_RESCHEDULED',
        'BOOKING_CANCELLED',
        'MEMBERSHIP_EXPIRING_SOON',
        'MEMBERSHIP_EXPIRED',
        'PAYMENT_RECEIPT',
        'REFUND_PROCESSED',
        'ADMIN_ALERT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CORE ENTITIES DDL
-- ------------------------------------------------------------------------------

-- Table 1: users (Central Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(25),
    role user_role NOT NULL DEFAULT 'CLIENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: owner_profiles
CREATE TABLE IF NOT EXISTS owner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL DEFAULT 'Executive Administration',
    permissions JSONB DEFAULT '{"all": true}'::jsonb,
    access_level VARCHAR(50) NOT NULL DEFAULT 'DIRECTOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: branches (Campuses)
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(50) PRIMARY KEY, -- 'madhapur', 'kokila', 'himayatnagar'
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL DEFAULT 'Hyderabad',
    area VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    daily_class_hours VARCHAR(50) NOT NULL DEFAULT '8:00 AM - 6:00 PM',
    class_slots_count INT NOT NULL DEFAULT 10 CHECK (class_slots_count > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: rooms (Acoustic Studio Resources)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    room_number INT NOT NULL CHECK (room_number > 0),
    name VARCHAR(100) NOT NULL,
    acoustic_type acoustic_room_type NOT NULL DEFAULT 'PIANO_SUITE',
    capacity INT NOT NULL DEFAULT 1 CHECK (capacity >= 1),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branch_room_number UNIQUE (branch_id, room_number)
);

-- Table 5: instruments (Curriculum)
CREATE TABLE IF NOT EXISTS instruments (
    id VARCHAR(50) PRIMARY KEY, -- 'guitar', 'piano', 'drums', 'sitar', 'violin', 'ukulele', 'trumpet'
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    starting_price_per_month NUMERIC(10, 2) NOT NULL CHECK (starting_price_per_month > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: branch_instruments (Join: Campus Offering Matrix)
CREATE TABLE IF NOT EXISTS branch_instruments (
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (branch_id, instrument_id)
);

-- Table 7: members (Student Profiles)
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY, -- 'APD-M-1001'
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    enrolled_instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    status membership_status NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    emergency_contact VARCHAR(100),
    total_classes_attended INT NOT NULL DEFAULT 0 CHECK (total_classes_attended >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: teachers (Faculty Mentors)
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY, -- 'APD-T-201'
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    employment_status VARCHAR(50) NOT NULL DEFAULT 'Active',
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bio TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: teacher_instruments (Join: Faculty Certification Matrix)
CREATE TABLE IF NOT EXISTS teacher_instruments (
    teacher_id VARCHAR(50) NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    years_experience INT NOT NULL DEFAULT 5 CHECK (years_experience >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, instrument_id)
);

-- Table 10: teacher_branches (Join: Faculty Campus Rosters)
CREATE TABLE IF NOT EXISTS teacher_branches (
    teacher_id VARCHAR(50) NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    is_home_branch BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teacher_id, branch_id)
);

-- Table 11: class_slots (Authoritative 10 Consecutive Daily Hours 08:00 - 18:00)
CREATE TABLE IF NOT EXISTS class_slots (
    id INT PRIMARY KEY CHECK (id BETWEEN 1 AND 10),
    slot_number INT UNIQUE NOT NULL CHECK (slot_number BETWEEN 1 AND 10),
    label VARCHAR(30) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL
);

-- Table 12: teacher_availabilities
CREATE TABLE IF NOT EXISTS teacher_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id VARCHAR(50) NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    slot_id INT NOT NULL REFERENCES class_slots(id) ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_day_slot UNIQUE (teacher_id, day_of_week, slot_id)
);

-- Table 13: membership_plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id VARCHAR(50) PRIMARY KEY, -- '1-month', '3-months', '6-months', '12-months'
    duration_months INT NOT NULL CHECK (duration_months IN (1, 3, 6, 12)),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percentage >= 0.00 AND discount_percentage <= 100.00),
    badge VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 14: plan_pricings (Configurable Pricing Matrix)
CREATE TABLE IF NOT EXISTS plan_pricings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id VARCHAR(50) NOT NULL REFERENCES membership_plans(id) ON DELETE CASCADE,
    instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    branch_id VARCHAR(50) REFERENCES branches(id) ON DELETE CASCADE,
    base_rate_per_month NUMERIC(10, 2) NOT NULL CHECK (base_rate_per_month > 0),
    raw_subtotal NUMERIC(10, 2) NOT NULL CHECK (raw_subtotal > 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    final_tuition_fee NUMERIC(10, 2) NOT NULL CHECK (final_tuition_fee > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_plan_instrument_branch UNIQUE (plan_id, instrument_id, branch_id)
);

-- Table 15: memberships (Purchased Subscriptions with Immutable Purchase Snapshot)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    plan_id VARCHAR(50) NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status membership_status NOT NULL DEFAULT 'ACTIVE',
    payment_status payment_status NOT NULL DEFAULT 'COLLECTED',
    
    -- Immutable Purchase Snapshots
    base_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (base_price_snapshot > 0),
    discount_amount_snapshot NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount_snapshot >= 0),
    payable_amount_snapshot NUMERIC(10, 2) NOT NULL CHECK (payable_amount_snapshot >= 0),
    plan_title_snapshot VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_membership_dates CHECK (expiry_date >= start_date)
);

-- Table 16: bookings (Class Sessions & Concurrency Control)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY, -- 'APD-BKG-8801'
    membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    instrument_id VARCHAR(50) NOT NULL REFERENCES instruments(id) ON DELETE RESTRICT,
    teacher_id VARCHAR(50) REFERENCES teachers(id) ON DELETE SET NULL,
    class_date DATE NOT NULL,
    slot_id INT NOT NULL REFERENCES class_slots(id) ON DELETE RESTRICT,
    slot_label VARCHAR(30) NOT NULL,
    status booking_status NOT NULL DEFAULT 'CONFIRMED',
    payment_mode VARCHAR(50),
    cancellation_reason TEXT,
    rescheduled_from_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 17: payments (Financial Ledger Inflow)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY, -- 'RCPT-9041'
    membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
    member_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (refund_amount >= 0 AND refund_amount <= amount),
    method payment_method NOT NULL DEFAULT 'UPI',
    status payment_status NOT NULL DEFAULT 'COLLECTED',
    transaction_ref VARCHAR(100) UNIQUE,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 18: refunds (Financial Ledger Outflow / Audited Deductions)
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(50) PRIMARY KEY, -- 'RFND-501'
    payment_id VARCHAR(50) NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    processed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    gateway_refund_ref VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 19: expense_categories (Normalized Expense Schema)
CREATE TABLE IF NOT EXISTS expense_categories (
    id expense_category_type PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    allocation_type VARCHAR(50) NOT NULL DEFAULT 'DIRECT'
);

-- Table 20: expenses (Operating Costs Outflow)
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY, -- 'EXP-401'
    title VARCHAR(150) NOT NULL,
    category_id expense_category_type NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    branch_id VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    instrument_id VARCHAR(50) REFERENCES instruments(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    vendor VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 21: audit_logs (Enterprise Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    changes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 22: notifications (Transactional Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. CONCURRENCY EXCLUSION & PARTIAL UNIQUE INDEXES
-- ------------------------------------------------------------------------------

-- Ensure a Member cannot hold duplicate active bookings for the same date and slot
-- Cancelled bookings do NOT block slot re-booking!
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_member_active_slot
ON bookings (member_id, class_date, slot_id)
WHERE status != 'CANCELLED';

-- Ensure a Teacher cannot be double-booked across any campus for the same date and slot
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_teacher_active_slot
ON bookings (teacher_id, class_date, slot_id)
WHERE status != 'CANCELLED' AND teacher_id IS NOT NULL;

-- Ensure an Acoustic Studio Room cannot be double-occupied for the same date and slot
CREATE UNIQUE INDEX IF NOT EXISTS uq_booking_room_active_slot
ON bookings (branch_id, room_id, class_date, slot_id)
WHERE status != 'CANCELLED' AND room_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 5. PERFORMANCE QUERY INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_members_branch ON members(branch_id);
CREATE INDEX IF NOT EXISTS idx_members_instrument ON members(enrolled_instrument_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

CREATE INDEX IF NOT EXISTS idx_memberships_member ON memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_expiry ON memberships(expiry_date);
CREATE INDEX IF NOT EXISTS idx_memberships_status_expiry ON memberships(status, expiry_date);

CREATE INDEX IF NOT EXISTS idx_bookings_date_slot ON bookings(class_date, slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON bookings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_branch_date ON bookings(branch_id, class_date);

CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch ON payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at);

CREATE INDEX IF NOT EXISTS idx_expenses_branch_date ON expenses(branch_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 6. REUSABLE ANALYTICAL & REPORTING VIEWS
-- ------------------------------------------------------------------------------

-- View 1: vw_active_memberships
CREATE OR REPLACE VIEW vw_active_memberships AS
SELECT
    m.id AS membership_id,
    m.member_id,
    mem.full_name AS member_name,
    mem.email AS member_email,
    mem.phone AS member_phone,
    m.branch_id,
    b.name AS branch_name,
    m.instrument_id,
    i.name AS instrument_name,
    m.plan_id,
    m.plan_title_snapshot AS plan_title,
    m.start_date,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE) AS days_remaining,
    m.status,
    m.payment_status,
    m.payable_amount_snapshot AS payable_amount
FROM memberships m
JOIN members mem ON m.member_id = mem.id
JOIN branches b ON m.branch_id = b.id
JOIN instruments i ON m.instrument_id = i.id
WHERE m.status IN ('ACTIVE', 'EXPIRING_SOON')
  AND m.expiry_date >= CURRENT_DATE;

-- View 2: vw_expiring_memberships (Renewal Watchlist)
CREATE OR REPLACE VIEW vw_expiring_memberships AS
SELECT
    m.id AS membership_id,
    m.member_id,
    mem.full_name AS member_name,
    mem.email AS member_email,
    mem.phone AS member_phone,
    b.name AS branch_name,
    i.name AS instrument_name,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE) AS days_remaining,
    CASE
        WHEN m.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN (m.expiry_date - CURRENT_DATE) <= 7 THEN 'CRITICAL_7_DAYS'
        WHEN (m.expiry_date - CURRENT_DATE) <= 15 THEN 'EXPIRING_15_DAYS'
        WHEN (m.expiry_date - CURRENT_DATE) <= 30 THEN 'UPCOMING_30_DAYS'
        ELSE 'ACTIVE'
    END AS urgency_tier
FROM memberships m
JOIN members mem ON m.member_id = mem.id
JOIN branches b ON m.branch_id = b.id
JOIN instruments i ON m.instrument_id = i.id
WHERE m.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
ORDER BY m.expiry_date ASC;

-- View 3: vw_enrollments_by_instrument
CREATE OR REPLACE VIEW vw_enrollments_by_instrument AS
SELECT
    i.id AS instrument_id,
    i.name AS instrument_name,
    i.category,
    i.starting_price_per_month,
    COUNT(m.id) AS total_enrolled_students,
    COUNT(m.id) FILTER (WHERE m.status = 'ACTIVE') AS active_students,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED') AS upcoming_bookings_count
FROM instruments i
LEFT JOIN members m ON i.id = m.enrolled_instrument_id
LEFT JOIN bookings bkg ON i.id = bkg.instrument_id AND bkg.class_date >= CURRENT_DATE
GROUP BY i.id, i.name, i.category, i.starting_price_per_month
ORDER BY active_students DESC;

-- View 4: vw_enrollments_by_branch
CREATE OR REPLACE VIEW vw_enrollments_by_branch AS
SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    b.city,
    b.area,
    COUNT(DISTINCT r.id) AS total_rooms,
    COUNT(DISTINCT m.id) AS total_enrolled_members,
    COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'ACTIVE') AS active_members,
    COUNT(DISTINCT tb.teacher_id) AS assigned_teachers
FROM branches b
LEFT JOIN rooms r ON b.id = r.branch_id
LEFT JOIN members m ON b.id = m.branch_id
LEFT JOIN teacher_branches tb ON b.id = tb.branch_id
GROUP BY b.id, b.name, b.city, b.area
ORDER BY active_members DESC;

-- View 5: vw_teacher_workload
CREATE OR REPLACE VIEW vw_teacher_workload AS
SELECT
    t.id AS teacher_id,
    t.full_name AS teacher_name,
    t.email,
    t.rating,
    COUNT(DISTINCT ti.instrument_id) AS certified_instruments_count,
    COUNT(DISTINCT tb.branch_id) AS assigned_branches_count,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED') AS upcoming_class_hours,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'COMPLETED') AS completed_class_hours
FROM teachers t
LEFT JOIN teacher_instruments ti ON t.id = ti.teacher_id
LEFT JOIN teacher_branches tb ON t.id = tb.teacher_id
LEFT JOIN bookings bkg ON t.id = bkg.teacher_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.full_name, t.email, t.rating
ORDER BY upcoming_class_hours DESC;

-- View 6: vw_booking_occupancy
CREATE OR REPLACE VIEW vw_booking_occupancy AS
SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    bkg.class_date,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED') AS booked_slots_count,
    (COUNT(DISTINCT r.id) * 10) AS max_daily_capacity_slots,
    ROUND(
        (COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED')::NUMERIC / NULLIF(COUNT(DISTINCT r.id) * 10, 0)) * 100,
        1
    ) AS occupancy_percentage
FROM branches b
JOIN rooms r ON b.id = r.branch_id
LEFT JOIN bookings bkg ON b.id = bkg.branch_id
GROUP BY b.id, b.name, bkg.class_date
ORDER BY bkg.class_date DESC, occupancy_percentage DESC;

-- View 7: vw_financial_summary_by_period
CREATE OR REPLACE VIEW vw_financial_summary_by_period AS
WITH monthly_payments AS (
    SELECT
        DATE_TRUNC('month', created_at)::DATE AS period_month,
        SUM(amount) FILTER (WHERE status = 'COLLECTED') AS collected_revenue,
        SUM(amount) FILTER (WHERE status = 'PENDING') AS pending_revenue,
        SUM(refund_amount) AS total_refunds
    FROM payments
    GROUP BY DATE_TRUNC('month', created_at)::DATE
),
monthly_expenses AS (
    SELECT
        DATE_TRUNC('month', date)::DATE AS period_month,
        SUM(amount) AS total_expenses,
        SUM(amount) FILTER (WHERE category_id = 'TEACHER_COMPENSATION') AS teacher_compensation,
        SUM(amount) FILTER (WHERE category_id != 'TEACHER_COMPENSATION') AS operating_expenses
    FROM expenses
    GROUP BY DATE_TRUNC('month', date)::DATE
)
SELECT
    COALESCE(p.period_month, e.period_month) AS period_month,
    COALESCE(p.collected_revenue, 0) + COALESCE(p.pending_revenue, 0) AS gross_billed,
    COALESCE(p.collected_revenue, 0) AS collected_payments,
    COALESCE(p.total_refunds, 0) AS refunds_deducted,
    (COALESCE(p.collected_revenue, 0) - COALESCE(p.total_refunds, 0)) AS recognized_revenue,
    COALESCE(e.total_expenses, 0) AS total_expenses,
    COALESCE(e.teacher_compensation, 0) AS teacher_compensation,
    COALESCE(e.operating_expenses, 0) AS operating_expenses,
    ((COALESCE(p.collected_revenue, 0) - COALESCE(p.total_refunds, 0)) - COALESCE(e.total_expenses, 0)) AS net_profit,
    CASE
        WHEN (COALESCE(p.collected_revenue, 0) - COALESCE(p.total_refunds, 0)) > 0 THEN
            ROUND(
                (((COALESCE(p.collected_revenue, 0) - COALESCE(p.total_refunds, 0)) - COALESCE(e.total_expenses, 0)) /
                (COALESCE(p.collected_revenue, 0) - COALESCE(p.total_refunds, 0))) * 100,
                1
            )
        ELSE 0.0
    END AS profit_margin_percentage
FROM monthly_payments p
FULL OUTER JOIN monthly_expenses e ON p.period_month = e.period_month
ORDER BY period_month DESC;

-- View 8: vw_financials_by_instrument
CREATE OR REPLACE VIEW vw_financials_by_instrument AS
WITH instrument_revenue AS (
    SELECT
        instrument_id,
        SUM(amount - refund_amount) AS recognized_revenue
    FROM payments
    WHERE status = 'COLLECTED' AND instrument_id IS NOT NULL
    GROUP BY instrument_id
),
instrument_expenses AS (
    SELECT
        instrument_id,
        SUM(amount) AS direct_expenses
    FROM expenses
    WHERE instrument_id IS NOT NULL
    GROUP BY instrument_id
)
SELECT
    i.id AS instrument_id,
    i.name AS instrument_name,
    i.category,
    COALESCE(r.recognized_revenue, 0.00) AS recognized_revenue,
    COALESCE(e.direct_expenses, 0.00) AS direct_expenses,
    (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.direct_expenses, 0.00)) AS net_profit
FROM instruments i
LEFT JOIN instrument_revenue r ON i.id = r.instrument_id
LEFT JOIN instrument_expenses e ON i.id = e.instrument_id
ORDER BY recognized_revenue DESC;

-- View 9: vw_financials_by_branch
CREATE OR REPLACE VIEW vw_financials_by_branch AS
WITH branch_revenue AS (
    SELECT
        branch_id,
        SUM(amount) FILTER (WHERE status = 'COLLECTED') AS collected_payments,
        SUM(refund_amount) AS refunds_issued,
        SUM(amount - refund_amount) FILTER (WHERE status = 'COLLECTED') AS recognized_revenue
    FROM payments
    GROUP BY branch_id
),
branch_expenses AS (
    SELECT
        branch_id,
        SUM(amount) AS total_expenses
    FROM expenses
    GROUP BY branch_id
)
SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    b.city,
    b.area,
    COALESCE(r.collected_payments, 0.00) AS collected_payments,
    COALESCE(r.refunds_issued, 0.00) AS refunds_issued,
    COALESCE(r.recognized_revenue, 0.00) AS recognized_revenue,
    COALESCE(e.total_expenses, 0.00) AS total_expenses,
    (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.total_expenses, 0.00)) AS net_profit,
    CASE
        WHEN COALESCE(r.recognized_revenue, 0.00) > 0 THEN
            ROUND(((COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.total_expenses, 0.00)) / r.recognized_revenue) * 100, 1)
        ELSE 0.0
    END AS profit_margin_percentage
FROM branches b
LEFT JOIN branch_revenue r ON b.id = r.branch_id
LEFT JOIN branch_expenses e ON b.id = e.branch_id
ORDER BY recognized_revenue DESC;

-- View 10: vw_profitability_rankings (Handles Ties via DENSE_RANK)
CREATE OR REPLACE VIEW vw_profitability_rankings AS
SELECT
    i.id AS instrument_id,
    i.name AS instrument_name,
    COALESCE(f.recognized_revenue, 0.00) AS recognized_revenue,
    COALESCE(f.net_profit, 0.00) AS net_profit,
    DENSE_RANK() OVER (ORDER BY COALESCE(f.net_profit, 0.00) DESC) AS profitability_rank
FROM instruments i
LEFT JOIN vw_financials_by_instrument f ON i.id = f.instrument_id
ORDER BY profitability_rank ASC;
