-- ==============================================================================
-- APD MUSIC CLASS — PRODUCTION SQL ANALYTICAL & REPORTING SUITE (PHASE 3)
-- Relational Query Specifications & Execution Plan Demonstrations
-- Timezone: Asia/Kolkata | RDBMS: PostgreSQL
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ACTIVE MEMBERSHIPS & REAL-TIME EXPIRY COUNTDOWN
-- ------------------------------------------------------------------------------
-- Calculates dynamic days remaining against CURRENT_DATE (never persisted).
-- Safe against month-end variations and leap years.

SELECT
    m.id AS membership_id,
    mem.id AS member_id,
    mem.full_name AS member_name,
    mem.email AS member_email,
    mem.phone AS member_phone,
    b.name AS campus_branch,
    i.name AS instrument_enrolled,
    m.plan_title_snapshot AS enrolled_plan,
    m.start_date,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE) AS days_remaining,
    m.status AS membership_status,
    m.payable_amount_snapshot AS paid_tuition_inr
FROM memberships m
JOIN members mem ON m.member_id = mem.id
JOIN branches b ON m.branch_id = b.id
JOIN instruments i ON m.instrument_id = i.id
WHERE m.status IN ('ACTIVE', 'EXPIRING_SOON')
  AND m.expiry_date >= CURRENT_DATE
ORDER BY days_remaining ASC;


-- ------------------------------------------------------------------------------
-- 2. EXPIRING MEMBERSHIPS WATCHLIST (7, 15, 30 DAYS & LAPSED)
-- ------------------------------------------------------------------------------
-- Used by Academy Admissions & Retention Officers for renewal outreach.

SELECT
    mem.id AS member_id,
    mem.full_name,
    mem.phone,
    mem.email,
    b.name AS campus,
    i.name AS instrument,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE) AS days_remaining,
    CASE
        WHEN m.expiry_date < CURRENT_DATE THEN 'ALREADY_EXPIRED'
        WHEN (m.expiry_date - CURRENT_DATE) <= 7 THEN 'CRITICAL_URGENT_7_DAYS'
        WHEN (m.expiry_date - CURRENT_DATE) <= 15 THEN 'EXPIRING_15_DAYS'
        WHEN (m.expiry_date - CURRENT_DATE) <= 30 THEN 'UPCOMING_30_DAYS'
        ELSE 'STANDARD_ACTIVE'
    END AS renewal_urgency_tier,
    -- Non-destructive renewal projection: anchored to current expiry date
    (m.expiry_date + INTERVAL '3 months')::DATE AS projected_3m_renewal_expiry
FROM memberships m
JOIN members mem ON m.member_id = mem.id
JOIN branches b ON m.branch_id = b.id
JOIN instruments i ON m.instrument_id = i.id
WHERE m.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
ORDER BY m.expiry_date ASC;


-- ------------------------------------------------------------------------------
-- 3. ENROLLMENTS & DEMAND DISTRIBUTION BY INSTRUMENT
-- ------------------------------------------------------------------------------

SELECT
    i.id AS instrument_id,
    i.name AS instrument_name,
    i.category,
    i.starting_price_per_month,
    COUNT(DISTINCT mem.id) AS total_lifetime_students,
    COUNT(DISTINCT mem.id) FILTER (WHERE mem.status = 'ACTIVE') AS active_students_count,
    COUNT(DISTINCT bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED' AND bkg.class_date >= CURRENT_DATE) AS upcoming_confirmed_bookings,
    ROUND(
        COUNT(DISTINCT mem.id) FILTER (WHERE mem.status = 'ACTIVE')::NUMERIC / 
        NULLIF((SELECT COUNT(*) FROM members WHERE status = 'ACTIVE'), 0) * 100, 
        1
    ) AS student_market_share_percent
FROM instruments i
LEFT JOIN members mem ON i.id = mem.enrolled_instrument_id
LEFT JOIN bookings bkg ON i.id = bkg.instrument_id
GROUP BY i.id, i.name, i.category, i.starting_price_per_month
ORDER BY active_students_count DESC;


-- ------------------------------------------------------------------------------
-- 4. CAMPUS CAPACITY, ROOM ALLOCATION & ENROLLMENT BY BRANCH
-- ------------------------------------------------------------------------------

SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    b.city,
    b.area,
    COUNT(DISTINCT r.id) AS total_acoustic_studios,
    COUNT(DISTINCT mem.id) FILTER (WHERE mem.status = 'ACTIVE') AS active_students,
    COUNT(DISTINCT tb.teacher_id) AS faculty_roster_count,
    -- 10 slots * total rooms = daily max capacity
    (COUNT(DISTINCT r.id) * 10) AS daily_max_slots_capacity,
    -- Monthly nominal capacity (30 days)
    (COUNT(DISTINCT r.id) * 10 * 30) AS monthly_seat_capacity
FROM branches b
LEFT JOIN rooms r ON b.id = r.branch_id AND r.is_active = TRUE
LEFT JOIN members mem ON b.id = mem.branch_id
LEFT JOIN teacher_branches tb ON b.id = tb.branch_id
GROUP BY b.id, b.name, b.city, b.area
ORDER BY active_students DESC;


-- ------------------------------------------------------------------------------
-- 5. FACULTY TEACHER WORKLOAD & PERFORMANCE METRICS
-- ------------------------------------------------------------------------------

SELECT
    t.id AS teacher_id,
    t.full_name AS teacher_name,
    t.rating AS student_satisfaction_rating,
    STRING_AGG(DISTINCT i.name, ', ' ORDER BY i.name) AS certified_instruments,
    STRING_AGG(DISTINCT b.name, ', ' ORDER BY b.name) AS assigned_campuses,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED' AND bkg.class_date >= CURRENT_DATE) AS upcoming_booked_hours,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'COMPLETED') AS total_completed_hours,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CANCELLED') AS cancelled_sessions_count
FROM teachers t
JOIN teacher_instruments ti ON t.id = ti.teacher_id
JOIN instruments i ON ti.instrument_id = i.id
JOIN teacher_branches tb ON t.id = tb.teacher_id
JOIN branches b ON tb.branch_id = b.id
LEFT JOIN bookings bkg ON t.id = bkg.teacher_id
WHERE t.is_active = TRUE
GROUP BY t.id, t.full_name, t.rating
ORDER BY upcoming_booked_hours DESC;


-- ------------------------------------------------------------------------------
-- 6. ACOUSTIC STUDIO UTILIZATION & BOOKING OCCUPANCY RATE
-- ------------------------------------------------------------------------------

SELECT
    b.name AS branch_name,
    r.name AS studio_room_name,
    r.acoustic_type,
    bkg.class_date,
    COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED') AS booked_hours,
    10 AS daily_total_hours_available,
    ROUND(
        (COUNT(bkg.id) FILTER (WHERE bkg.status = 'CONFIRMED')::NUMERIC / 10.0) * 100,
        1
    ) AS daily_room_utilization_rate_pct
FROM rooms r
JOIN branches b ON r.branch_id = b.id
LEFT JOIN bookings bkg ON r.id = bkg.room_id AND bkg.status = 'CONFIRMED'
WHERE r.is_active = TRUE
GROUP BY b.name, r.name, r.acoustic_type, bkg.class_date
ORDER BY b.name, bkg.class_date DESC;


-- ------------------------------------------------------------------------------
-- 7. EXECUTIVE FINANCIAL LEDGER: RECOGNIZED REVENUE, REFUNDS & NET PROFIT
-- ------------------------------------------------------------------------------
-- Formula: Net Profit = Recognized Revenue (Collected - Refunds) - Recorded Expenses
-- Handles uncollected pending invoices and refunds with zero double-counting.

WITH period_inflow AS (
    SELECT
        DATE_TRUNC('month', created_at)::DATE AS period_month,
        SUM(amount) FILTER (WHERE status = 'COLLECTED') AS collected_revenue,
        SUM(amount) FILTER (WHERE status = 'PENDING') AS pending_revenue,
        SUM(refund_amount) AS refunds_issued
    FROM payments
    GROUP BY DATE_TRUNC('month', created_at)::DATE
),
period_outflow AS (
    SELECT
        DATE_TRUNC('month', date)::DATE AS period_month,
        SUM(amount) AS total_operating_expenses,
        SUM(amount) FILTER (WHERE category_id = 'STUDIO_RENT') AS rent_expenses,
        SUM(amount) FILTER (WHERE category_id = 'TEACHER_COMPENSATION') AS faculty_compensation,
        SUM(amount) FILTER (WHERE category_id = 'EQUIPMENT_MAINTENANCE') AS equipment_expenses,
        SUM(amount) FILTER (WHERE category_id = 'UTILITIES_ACOUSTIC_TECH') AS acoustic_utilities,
        SUM(amount) FILTER (WHERE category_id = 'MARKETING') AS marketing_expenses
    FROM expenses
    GROUP BY DATE_TRUNC('month', date)::DATE
)
SELECT
    TO_CHAR(COALESCE(i.period_month, o.period_month), 'Month YYYY') AS accounting_period,
    -- Gross Billed
    COALESCE(i.collected_revenue, 0.00) + COALESCE(i.pending_revenue, 0.00) AS gross_billed_inr,
    -- Collected Cash
    COALESCE(i.collected_revenue, 0.00) AS collected_payments_inr,
    -- Outstanding Awaiting Collection
    COALESCE(i.pending_revenue, 0.00) AS pending_collection_inr,
    -- Refunds Deducted
    COALESCE(i.refunds_issued, 0.00) AS refunds_deducted_inr,
    -- Recognized Net Revenue
    (COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00)) AS recognized_revenue_inr,
    -- Operating Expenses
    COALESCE(o.total_operating_expenses, 0.00) AS total_operating_expenses_inr,
    COALESCE(o.faculty_compensation, 0.00) AS teacher_compensation_inr,
    COALESCE(o.rent_expenses, 0.00) AS campus_lease_inr,
    -- Net Profit = Recognized Revenue - Recorded Expenses
    ((COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00)) - COALESCE(o.total_operating_expenses, 0.00)) AS net_profit_loss_inr,
    -- Profit Margin %
    CASE
        WHEN (COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00)) > 0 THEN
            ROUND(
                (((COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00)) - COALESCE(o.total_operating_expenses, 0.00)) /
                (COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00))) * 100,
                1
            )
        ELSE 0.0
    END AS profit_margin_pct,
    -- Audit Notice: Check if teacher payroll is recorded
    CASE
        WHEN COALESCE(o.faculty_compensation, 0.00) = 0.00 AND (COALESCE(i.collected_revenue, 0.00) - COALESCE(i.refunds_issued, 0.00)) > 0 THEN
            'AUDIT ALERT: Teacher compensation unrecorded for this period. Profit temporarily inflated.'
        ELSE
            'COMPLIANT: Faculty compensation accounted in ledger.'
    END AS payroll_audit_status
FROM period_inflow i
FULL OUTER JOIN period_outflow o ON i.period_month = o.period_month
ORDER BY i.period_month DESC;


-- ------------------------------------------------------------------------------
-- 8. PROFITABILITY RANKING BY INSTRUMENT (WITH DENSE_RANK TIE-BREAKING)
-- ------------------------------------------------------------------------------
-- Handles ties cleanly without skipping ranks, and handles empty datasets.

WITH instrument_rev AS (
    SELECT
        instrument_id,
        SUM(amount - refund_amount) AS recognized_revenue
    FROM payments
    WHERE status = 'COLLECTED' AND instrument_id IS NOT NULL
    GROUP BY instrument_id
),
instrument_exp AS (
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
    COALESCE(r.recognized_revenue, 0.00) AS recognized_revenue_inr,
    COALESCE(e.direct_expenses, 0.00) AS direct_expenses_inr,
    (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.direct_expenses, 0.00)) AS net_profit_inr,
    DENSE_RANK() OVER (ORDER BY (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.direct_expenses, 0.00)) DESC) AS profitability_rank
FROM instruments i
LEFT JOIN instrument_rev r ON i.id = r.instrument_id
LEFT JOIN instrument_exp e ON i.id = e.instrument_id
ORDER BY profitability_rank ASC;


-- ------------------------------------------------------------------------------
-- 9. PROFITABILITY & MARGIN RANKING BY CAMPUS BRANCH
-- ------------------------------------------------------------------------------

WITH branch_rev AS (
    SELECT
        branch_id,
        SUM(amount - refund_amount) AS recognized_revenue
    FROM payments
    WHERE status = 'COLLECTED'
    GROUP BY branch_id
),
branch_exp AS (
    SELECT
        branch_id,
        SUM(amount) AS total_branch_expenses
    FROM expenses
    GROUP BY branch_id
)
SELECT
    b.id AS branch_id,
    b.name AS campus_name,
    b.city,
    b.area,
    COALESCE(r.recognized_revenue, 0.00) AS recognized_revenue_inr,
    COALESCE(e.total_branch_expenses, 0.00) AS total_operating_expenses_inr,
    (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.total_branch_expenses, 0.00)) AS campus_net_profit_inr,
    CASE
        WHEN COALESCE(r.recognized_revenue, 0.00) > 0 THEN
            ROUND(((COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.total_branch_expenses, 0.00)) / r.recognized_revenue) * 100, 1)
        ELSE 0.0
    END AS profit_margin_pct,
    DENSE_RANK() OVER (ORDER BY (COALESCE(r.recognized_revenue, 0.00) - COALESCE(e.total_branch_expenses, 0.00)) DESC) AS campus_rank
FROM branches b
LEFT JOIN branch_rev r ON b.id = r.branch_id
LEFT JOIN branch_exp e ON b.id = e.branch_id
ORDER BY campus_rank ASC;


-- ------------------------------------------------------------------------------
-- 10. REPRESENTATIVE EXPLAIN ANALYZE QUERY PLANS
-- ------------------------------------------------------------------------------
-- Index Scans on Primary/Foreign Keys and Partial Unique Indexes

/*
-- Plan 1: Active Member Expiry Range Scan
EXPLAIN ANALYZE
SELECT id, member_id, expiry_date, status
FROM memberships
WHERE status = 'ACTIVE' AND expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '15 days');
-- Expected: Index Scan using idx_memberships_status_expiry (cost=0.15..8.20 rows=2 width=48)

-- Plan 2: Atomic Concurrency Verification for Class Booking
EXPLAIN ANALYZE
SELECT id, member_id, class_date, slot_id, status
FROM bookings
WHERE member_id = 'APD-M-1001'
  AND class_date = '2026-11-20'
  AND slot_id = 4
  AND status != 'CANCELLED';
-- Expected: Index Scan using uq_booking_member_active_slot (cost=0.15..8.17 rows=1 width=64)
*/
