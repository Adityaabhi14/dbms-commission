# APD MUSIC CLASS — Production-Grade Relational Database Architecture (Phase 3)

**Authoritative DBMS Technical Specification & Relational Catalog**  
*Target RDBMS:* PostgreSQL 14+ / 15+ / 16+  
*ORM & Migration Engine:* Prisma Client & Versioned SQL Migrations  
*Normalization Level:* Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)  
*Academy Operating Timezone:* `Asia/Kolkata` (IST, UTC+05:30)  
*Primary Currency:* INR (`NUMERIC(10, 2)`)

---

## 1. Executive Summary & Architecture Overview

The **APD MUSIC CLASS** relational database is engineered to support a high-volume, multi-campus music academy managing 7 instrument disciplines across 3 campuses in Hyderabad (Madhapur, Kokila, Himayatnagar). The architecture enforces strict mathematical integrity across:
1. **Calendar-Month Arithmetic**: Dynamic expiry calculations handling variable month lengths (28, 29, 30, 31 days) without 30-day drift.
2. **Immutable Financial Ledger**: Dual-entry accounting guaranteeing that Recognized Revenue equals cash collected minus audited refunds, with operating expenses separated into direct teaching and campus overhead.
3. **Transactional Booking & Concurrency**: 10 daily 1-hour slots (08:00–18:00) with zero-tolerance collision protection enforced at the database level via PostgreSQL partial unique indexes (`WHERE status != 'CANCELLED'`).

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o| owner_profiles : "1:1 profile"
    users ||--o| members : "1:1 profile"
    users ||--o| teachers : "1:1 profile"
    users ||--o{ audit_logs : "performs"
    users ||--o{ notifications : "receives"
    users ||--o{ refunds : "authorizes"

    branches ||--o{ rooms : "contains 5 studios"
    branches ||--o{ branch_instruments : "offers"
    branches ||--o{ teacher_branches : "hosts"
    branches ||--o{ members : "home campus"
    branches ||--o{ memberships : "registered at"
    branches ||--o{ bookings : "holds"
    branches ||--o{ expenses : "incurs"
    branches ||--o{ payments : "receives"
    branches ||--o{ plan_pricings : "overrides"

    instruments ||--o{ branch_instruments : "available in"
    instruments ||--o{ teacher_instruments : "taught by"
    instruments ||--o{ plan_pricings : "priced for"
    instruments ||--o{ members : "enrolled in"
    instruments ||--o{ memberships : "studies"
    instruments ||--o{ bookings : "practiced in"
    instruments ||--o{ expenses : "allocated"

    teachers ||--o{ teacher_instruments : "certified in"
    teachers ||--o{ teacher_branches : "assigned to"
    teachers ||--o{ teacher_availabilities : "specifies"
    teachers ||--o{ bookings : "instructs"

    class_slots ||--o{ teacher_availabilities : "available during"
    class_slots ||--o{ bookings : "scheduled at"

    rooms ||--o{ bookings : "occupies"

    membership_plans ||--o{ plan_pricings : "defines rates"
    membership_plans ||--o{ memberships : "selected plan"

    members ||--o{ memberships : "holds"
    members ||--o{ bookings : "books"
    members ||--o{ payments : "pays"

    memberships ||--o{ bookings : "authorizes"
    memberships ||--o{ payments : "billed for"

    payments ||--o{ refunds : "refunded via"

    expense_categories ||--o{ expenses : "categorized as"
```

---

## 3. Database Normalization & Integrity Proofs

The schema adheres to Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF):

### 3.1 First Normal Form (1NF)
- **Atomic Values**: No composite or multi-valued attributes exist. All comma-separated strings (such as instruments taught or assigned campuses) have been extracted into first-class relational join tables (`teacher_instruments`, `teacher_branches`, `branch_instruments`).
- **Unique Rows**: Every tuple is uniquely identified by a primary key (`UUID` or structured deterministic identifier like `APD-M-1001`).

### 3.2 Second Normal Form (2NF)
- **Full Functional Dependency**: In all composite primary keys (e.g. `teacher_instruments(teacher_id, instrument_id)` and `branch_instruments(branch_id, instrument_id)`), non-key attributes (such as `is_primary` or `years_experience`) depend functionally on the *entire* candidate key, not a partial subset.

### 3.3 Third Normal Form (3NF)
- **Elimination of Transitive Dependencies**: Non-prime attributes depend solely on candidate keys. 
  - Dynamic fields such as `days_remaining` are **never** persisted in table columns. Persisting `days_remaining` violates 3NF because it creates a transitive dependency on the external current system date. It is calculated dynamically in SQL views (`(expiry_date - CURRENT_DATE)`).
  - Calculated fees are stored as **immutable purchase snapshots** (`base_price_snapshot`, `discount_amount_snapshot`, `payable_amount_snapshot`) on `memberships` rather than computing them on the fly from current catalog pricing, guaranteeing historical integrity.

### 3.4 Candidate Keys & Constraints Summary

| Entity | Primary Key | Candidate Keys / Unique Constraints | Foreign Keys & Deletion Policy |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | `email` (Case-insensitive unique) | — |
| `owner_profiles` | `id` (UUID) | `user_id` (Unique) | `user_id` → `users.id` (`CASCADE`) |
| `branches` | `id` (VARCHAR) | `name` | — |
| `rooms` | `id` (UUID) | `(branch_id, room_number)` | `branch_id` → `branches.id` (`CASCADE`) |
| `instruments` | `id` (VARCHAR) | `name` | — |
| `branch_instruments` | `(branch_id, instrument_id)` | Candidate key is composite PK | Cascades to branch & instrument |
| `teachers` | `id` (VARCHAR) | `user_id`, `email` | `user_id` → `users.id` (`SET NULL`) |
| `teacher_instruments` | `(teacher_id, instrument_id)` | Composite PK | Cascades to teacher & instrument |
| `teacher_branches` | `(teacher_id, branch_id)` | Composite PK | Cascades to teacher & branch |
| `class_slots` | `id` (INT 1..10) | `slot_number` (1..10) | — |
| `teacher_availabilities` | `id` (UUID) | `(teacher_id, day_of_week, slot_id)` | Cascades to teacher & class_slot |
| `membership_plans` | `id` (VARCHAR) | `duration_months` (1, 3, 6, 12) | — |
| `plan_pricings` | `id` (UUID) | `(plan_id, instrument_id, branch_id)` | Cascades to plan, instrument, branch |
| `members` | `id` (VARCHAR) | `user_id`, `email` | `branch_id` (`RESTRICT`), `instrument_id` (`RESTRICT`) |
| `memberships` | `id` (UUID) | — | All relations (`RESTRICT`) |
| `bookings` | `id` (VARCHAR) | Partial Unique Indexes (see Section 5) | `member_id` (`RESTRICT`), `slot_id` (`RESTRICT`) |
| `payments` | `id` (VARCHAR) | `transaction_ref`, `idempotency_key` | `member_id` (`RESTRICT`), `branch_id` (`RESTRICT`) |
| `refunds` | `id` (VARCHAR) | `gateway_refund_ref` | `payment_id` (`RESTRICT`) |
| `expenses` | `id` (VARCHAR) | — | `category_id` (`RESTRICT`), `branch_id` (`RESTRICT`) |
| `audit_logs` | `id` (UUID) | — | `performed_by_user_id` (`SET NULL`) |

---

## 4. Deletion Policies & Referential Preservation

In an academy management system, deleting students or faculty must **never** corrupt historical accounting or classroom schedules:
- **Financial Transactions (`payments`, `refunds`, `expenses`, `memberships`)**: Protected with `ON DELETE RESTRICT`. If an administrator attempts to delete a member who has transaction history, the database rejects the command, mandating soft-deactivation (`is_active = FALSE`).
- **Class Bookings (`bookings`)**: Enforces `ON DELETE RESTRICT` for member records. Teacher references use `ON DELETE SET NULL` so that historical class records remain intact even if a faculty member leaves the academy.
- **Identity Cascades (`users` → `owner_profiles`, `members`)**: Cascades only down from the authentication identity layer when scrubbing test accounts.

---

## 5. Concurrency Control & Double-Booking Prevention

### 5.1 The Partial Unique Index Strategy
Standard unique constraints fail in booking systems because cancelled sessions would permanently block subsequent reservations for that slot. PostgreSQL **Partial Unique Indexes** resolve this by filtering `WHERE status != 'CANCELLED'`:

```sql
-- 1. Member Overlap Prevention
CREATE UNIQUE INDEX uq_booking_member_active_slot
ON bookings (member_id, class_date, slot_id)
WHERE status != 'CANCELLED';

-- 2. Teacher Overlap Prevention
CREATE UNIQUE INDEX uq_booking_teacher_active_slot
ON bookings (teacher_id, class_date, slot_id)
WHERE status != 'CANCELLED' AND teacher_id IS NOT NULL;

-- 3. Studio Room Capacity Collision Prevention
CREATE UNIQUE INDEX uq_booking_room_active_slot
ON bookings (branch_id, room_id, class_date, slot_id)
WHERE status != 'CANCELLED' AND room_id IS NOT NULL;
```

### 5.2 Transaction Isolation & Row-Level Locking
When booking or rescheduling a session, concurrent requests are guarded using `SELECT ... FOR UPDATE` row locks inside an atomic transaction:

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Lock teacher and room for inspection
SELECT id FROM teachers WHERE id = 'APD-T-202' FOR UPDATE;
SELECT id FROM rooms WHERE id = 'a0000002-0000-0000-0000-000000000001' FOR UPDATE;

-- Verify absence of active bookings
SELECT COUNT(*) FROM bookings
WHERE teacher_id = 'APD-T-202'
  AND class_date = '2026-11-20'
  AND slot_id = 4
  AND status != 'CANCELLED';

-- Insert booking (backed by partial unique index)
INSERT INTO bookings (id, member_id, branch_id, room_id, instrument_id, teacher_id, class_date, slot_id, slot_label, status)
VALUES ('APD-BKG-8901', 'APD-M-1001', 'kokila', 'a0000002-0000-0000-0000-000000000001', 'piano', 'APD-T-202', '2026-11-20', 4, '11:00–12:00', 'CONFIRMED');

COMMIT;
```

---

## 6. Financial Ledger & Revenue Recognition

The database enforces sound accounting principles:
1. **Gross Revenue Billed**: Total billed invoices (`status IN ('COLLECTED', 'PENDING')`).
2. **Collected Payments**: Actual cash deposited in bank/gateway accounts (`status = 'COLLECTED'`).
3. **Refund Deductions**: Every refund record is attached to an authoritative payment voucher and deducted from recognized revenue.
4. **Recognized Revenue**:
   $$\text{Recognized Revenue} = \text{Collected Payments} - \text{Total Audited Refunds}$$
5. **Net Profit Formula**:
   $$\text{Net Profit} = \text{Recognized Revenue} - \text{Total Operating Expenses}$$
6. **No Double-Counting**: Membership totals are snapshots of contracts; financial accounting queries compute figures solely from the immutable `payments`, `refunds`, and `expenses` tables.

---

## 7. PostgreSQL Analytical Views

The database defines 10 pre-compiled views for operational and executive dashboards:

1. **`vw_active_memberships`**: Real-time active memberships joined with student, campus, instrument, and plan details.
2. **`vw_expiring_memberships`**: Automated renewal watchlist categorizing memberships into `< 7 days`, `15 days`, `30 days`, or expired.
3. **`vw_enrollments_by_instrument`**: Instrument market share and active student counts.
4. **`vw_enrollments_by_branch`**: Campus capacity, room count, and active roster.
5. **`vw_teacher_workload`**: Total completed hours, upcoming hours, and ratings per mentor.
6. **`vw_booking_occupancy`**: Room-level daily capacity utilization percentages.
7. **`vw_financial_summary_by_period`**: Monthly executive profit & loss summary.
8. **`vw_financials_by_instrument`**: Direct profitability by instrument.
9. **`vw_financials_by_branch`**: Branch-level profit margin rankings.
10. **`vw_profitability_rankings`**: Ranks instruments using `DENSE_RANK() OVER (ORDER BY net_profit DESC)` to handle ties without gap anomalies.

---

## 8. Database Security & Operational Maintenance

### 8.1 Least-Privilege Database Roles

```sql
-- 1. Application Runtime Role (Web & API Server)
CREATE ROLE apd_app_user WITH LOGIN PASSWORD 'strong_production_password';
GRANT CONNECT ON DATABASE apd_music_db TO apd_app_user;
GRANT USAGE ON SCHEMA public TO apd_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO apd_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO apd_app_user;
REVOKE TRUNCATE, DROP, ALTER ON ALL TABLES IN SCHEMA public FROM apd_app_user;

-- 2. Read-Only Analytical Role (BI & Reporting Dashboards)
CREATE ROLE apd_readonly_analyst WITH LOGIN PASSWORD 'readonly_analyst_password';
GRANT CONNECT ON DATABASE apd_music_db TO apd_readonly_analyst;
GRANT USAGE ON SCHEMA public TO apd_readonly_analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO apd_readonly_analyst;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO apd_readonly_analyst;

-- 3. Migration Administrator Role (CI/CD Deployments)
CREATE ROLE apd_migration_admin WITH LOGIN PASSWORD 'migration_admin_password';
GRANT ALL PRIVILEGES ON DATABASE apd_music_db TO apd_migration_admin;
```

### 8.2 Backup & Disaster Recovery Runbook

```bash
# Automated Daily Logical Backup (Compressed with Custom Directory Format)
pg_dump -h localhost -p 5432 -U apd_migration_admin -F c -b -v \
  -f "/var/backups/apd_music_db_$(date +\%Y\%m\%d_\%H\%M\%S).dump" apd_music_db

# Point-in-Time Database Restore
pg_restore -h localhost -p 5432 -U apd_migration_admin -d apd_music_db \
  --clean --if-exists -v "/var/backups/apd_music_db_20261019_000000.dump"
```

### 8.3 Connection Pooling with PgBouncer
For high-concurrency production deployments:
- **Pool Mode**: `transaction`
- **Max Client Connections**: 500
- **Default Pool Size**: 25 per PostgreSQL core
- **Reserve Pool Size**: 5
- **Server Reset Query**: `DISCARD ALL`

---

## 9. Action Items for External PostgreSQL Provisioning

To connect a live remote or local PostgreSQL server:
1. Provide a standard PostgreSQL connection URI in `.env`:
   ```env
   DATABASE_URL="postgresql://apd_app_user:strong_password@localhost:5432/apd_music_db?schema=public&sslmode=prefer"
   ```
2. Execute the version-controlled migration:
   ```bash
   psql -d apd_music_db -f server/prisma/migrations/20261019000000_production_relational_schema/migration.sql
   ```
3. Run the development seeder:
   ```bash
   npx tsx server/prisma/seed.ts
   ```
