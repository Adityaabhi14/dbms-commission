import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { QueryRecord, QueryType, DockMode } from '../types/queryInspector';

export interface PresetQuery {
  id: string;
  title: string;
  category: 'DDL / Constraints' | '3NF / BCNF Joins' | 'ACID Transactions' | 'Analytics & Views';
  description: string;
  sql: string;
  type: QueryType;
  table: string;
}

export const DBMS_PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'preset-concurrency',
    title: 'ACID Transaction & Row Lock (Booking Concurrency)',
    category: 'ACID Transactions',
    description: 'Guarantees zero double-booking using SELECT ... FOR UPDATE row-level locks and isolation level READ COMMITTED.',
    type: 'TRANSACTION',
    table: 'bookings',
    sql: `BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 1. Acquire pessimistic row-level lock on studio room
SELECT id, branch_id, room_number 
FROM rooms 
WHERE branch_id = 'kokila' AND room_number = 1 
FOR UPDATE;

-- 2. Verify absence of overlapping active bookings
SELECT COUNT(*) AS active_conflicts 
FROM bookings 
WHERE branch_id = 'kokila' 
  AND room_number = 1 
  AND class_date = CURRENT_DATE + INTERVAL '1 day' 
  AND slot_id = 3 
  AND status != 'CANCELLED';

-- 3. Atomic insertion of confirmed reservation
INSERT INTO bookings (
  id, member_id, branch_id, room_number, 
  instrument_id, class_date, slot_id, slot_label, status
) VALUES (
  'APD-BKG-8899', 'APD-M-1001', 'kokila', 1, 
  'piano', CURRENT_DATE + INTERVAL '1 day', 3, '10:00–11:00', 'CONFIRMED'
);

-- 4. Immutable double-entry financial voucher
INSERT INTO payments (
  id, booking_id, member_id, branch_id, 
  amount, refund_amount, method, status
) VALUES (
  'RCPT-9901', 'APD-BKG-8899', 'APD-M-1001', 'kokila', 
  20400.00, 0.00, 'UPI', 'COLLECTED'
);

COMMIT;`
  },
  {
    id: 'preset-3nf-active-memberships',
    title: '3NF Analytical View (Active Memberships)',
    category: '3NF / BCNF Joins',
    description: 'Third Normal Form query joining student profiles, home campuses, instruments, and active plans without transitive dependencies.',
    type: 'SELECT',
    table: 'vw_active_memberships',
    sql: `SELECT 
    m.id AS member_id,
    u.full_name AS student_name,
    u.email AS student_email,
    b.name AS campus_name,
    i.name AS instrument_enrolled,
    mp.title AS plan_name,
    ms.start_date,
    ms.expiry_date,
    -- Dynamic computation: Eliminates transitive dependency on system clock (3NF Rule)
    (ms.expiry_date - CURRENT_DATE) AS days_remaining,
    ms.status AS membership_status
FROM memberships ms
INNER JOIN members m ON ms.member_id = m.id
INNER JOIN users u ON m.user_id = u.id
INNER JOIN branches b ON ms.branch_id = b.id
INNER JOIN instruments i ON ms.instrument_id = i.id
INNER JOIN membership_plans mp ON ms.plan_id = mp.id
WHERE ms.status IN ('ACTIVE', 'EXPIRING_SOON')
ORDER BY ms.expiry_date ASC;`
  },
  {
    id: 'preset-profitability-rankings',
    title: 'Window Function Ranking (DENSE_RANK() by Profit)',
    category: 'Analytics & Views',
    description: 'PostgreSQL analytical query ranking instruments by net profit margin using DENSE_RANK() over partition windows.',
    type: 'SELECT',
    table: 'vw_profitability_rankings',
    sql: `WITH instrument_pnl AS (
    SELECT 
        i.id AS instrument_id,
        i.name AS instrument_name,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'COLLECTED'), 0) AS gross_revenue,
        COALESCE(SUM(p.refund_amount), 0) AS total_refunds,
        COALESCE(SUM(e.amount), 0) AS direct_expenses,
        (
            COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'COLLECTED'), 0)
            - COALESCE(SUM(p.refund_amount), 0)
            - COALESCE(SUM(e.amount), 0)
        ) AS net_profit
    FROM instruments i
    LEFT JOIN payments p ON i.id = p.instrument_id
    LEFT JOIN expenses e ON i.id = e.instrument_id
    GROUP BY i.id, i.name
)
SELECT 
    instrument_name,
    gross_revenue,
    net_profit,
    ROUND((net_profit / NULLIF(gross_revenue, 0) * 100), 1) AS profit_margin_pct,
    DENSE_RANK() OVER (ORDER BY net_profit DESC) AS profitability_rank
FROM instrument_pnl
ORDER BY profitability_rank ASC;`
  },
  {
    id: 'preset-calendar-expiry',
    title: 'Calendar-Month Arithmetic (Zero 30-Day Drift)',
    category: 'DDL / Constraints',
    description: 'Demonstrates mathematically precise calendar-month expiry computation across variable 28, 29, 30, and 31-day months.',
    type: 'SELECT',
    table: 'memberships',
    sql: `-- Dynamic calendar arithmetic preserving end-of-month boundaries:
SELECT 
    id AS membership_id,
    start_date,
    -- PostgreSQL interval arithmetic handles leap years and variable month lengths
    (start_date + (mp.duration_months || ' months')::INTERVAL)::DATE AS calculated_expiry,
    expiry_date AS stored_expiry,
    CASE 
        WHEN (start_date + (mp.duration_months || ' months')::INTERVAL)::DATE = expiry_date THEN 'VERIFIED_CORRECT'
        ELSE 'MISMATCH'
    END AS mathematical_check
FROM memberships ms
JOIN membership_plans mp ON ms.plan_id = mp.id;`
  },
  {
    id: 'preset-partial-unique-index',
    title: 'Partial Unique Index (Concurrency Enforcement)',
    category: 'DDL / Constraints',
    description: 'DDL constraint specification preventing multiple active reservations in the same room and slot while permitting cancelled history.',
    type: 'DDL',
    table: 'bookings',
    sql: `-- Prevents overlapping reservations for the same room at the same slot
CREATE UNIQUE INDEX idx_bookings_room_slot_active
ON bookings (branch_id, room_number, class_date, slot_id)
WHERE status != 'CANCELLED';

-- Prevents faculty double-booking across campuses at the exact same slot
CREATE UNIQUE INDEX idx_bookings_teacher_slot_active
ON bookings (teacher_id, class_date, slot_id)
WHERE teacher_id IS NOT NULL AND status != 'CANCELLED';`
  }
];

// Initial deterministic queries representing app startup database hydration
const INITIAL_SEED_QUERIES: QueryRecord[] = [
  {
    id: 'QRY-INIT-101',
    timestamp: '18:14:02',
    sourceButton: 'Application Mount (Catalog Bootstrap)',
    pageContext: 'Global App Load',
    type: 'SELECT',
    primaryTable: 'instruments',
    relatedTables: ['branch_instruments'],
    sql: `SELECT id, name, category, starting_price_per_month, available_branches, is_active
FROM instruments
WHERE is_active = TRUE
ORDER BY name ASC;`,
    params: { is_active: true },
    executionTimeMs: 2.4,
    rowsAffected: '7 rows returned',
    isolationLevel: 'READ COMMITTED',
    dbmsConcept: '1NF Catalog Retrieval — Multivalued attributes normalized into branch_instruments relational link',
    status: 'SUCCESS'
  },
  {
    id: 'QRY-INIT-102',
    timestamp: '18:14:03',
    sourceButton: 'Campus Hydration',
    pageContext: 'Global App Load',
    type: 'SELECT',
    primaryTable: 'branches',
    relatedTables: ['rooms'],
    sql: `SELECT b.id, b.name, b.city, b.area, b.address, b.class_slots_count,
       COUNT(r.id) AS total_studios
FROM branches b
LEFT JOIN rooms r ON b.id = r.branch_id
WHERE b.is_active = TRUE
GROUP BY b.id, b.name, b.city, b.area, b.address, b.class_slots_count;`,
    params: { is_active: true },
    executionTimeMs: 3.1,
    rowsAffected: '3 campuses returned',
    isolationLevel: 'READ COMMITTED',
    dbmsConcept: 'Relational Aggregation: GROUP BY with foreign key branches.id = rooms.branch_id',
    status: 'SUCCESS'
  },
  {
    id: 'QRY-INIT-103',
    timestamp: '18:14:04',
    sourceButton: 'Active Membership View Monitor',
    pageContext: 'Operational Dashboard',
    type: 'SELECT',
    primaryTable: 'vw_active_memberships',
    relatedTables: ['memberships', 'members', 'branches', 'membership_plans'],
    sql: `SELECT member_id, student_name, campus_name, instrument_enrolled,
       plan_name, expiry_date, days_remaining
FROM vw_active_memberships
WHERE days_remaining <= 30
ORDER BY days_remaining ASC
LIMIT 5;`,
    params: { threshold_days: 30 },
    executionTimeMs: 4.8,
    rowsAffected: '4 rows returned',
    isolationLevel: 'READ COMMITTED',
    dbmsConcept: '3NF View: (expiry_date - CURRENT_DATE) calculated on the fly to eliminate transitive state dependency',
    status: 'SUCCESS'
  }
];

interface QueryInspectorContextType {
  queries: QueryRecord[];
  latestQuery: QueryRecord | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  dockMode: DockMode;
  setDockMode: (mode: DockMode) => void;
  toggleDockMode: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCapturing: boolean;
  setIsCapturing: (capturing: boolean) => void;
  queryToast: QueryRecord | null;
  dismissQueryToast: () => void;
  logQuery: (record: Omit<QueryRecord, 'id' | 'timestamp' | 'status'> & { id?: string; timestamp?: string; status?: 'SUCCESS' | 'ERROR' | 'ROLLEDBACK' }) => QueryRecord;
  clearQueries: () => void;
  executePresetQuery: (presetId: string) => void;
  exportSqlScript: () => void;
  totalQueriesCount: number;
}

const QueryInspectorContext = createContext<QueryInspectorContextType | undefined>(undefined);

export const QueryInspectorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queries, setQueries] = useState<QueryRecord[]>(INITIAL_SEED_QUERIES);
  const [latestQuery, setLatestQuery] = useState<QueryRecord | null>(INITIAL_SEED_QUERIES[0]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dockMode, setDockMode] = useState<DockMode>('floating');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const [queryToast, setQueryToast] = useState<QueryRecord | null>(null);

  const queryToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoggedTimestampRef = useRef<number>(0);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleDockMode = useCallback(() => {
    setDockMode(prev => (prev === 'floating' ? 'docked-right' : 'floating'));
  }, []);

  const dismissQueryToast = useCallback(() => {
    setQueryToast(null);
    if (queryToastTimeoutRef.current) {
      clearTimeout(queryToastTimeoutRef.current);
      queryToastTimeoutRef.current = null;
    }
  }, []);

  const logQuery = useCallback((record: Omit<QueryRecord, 'id' | 'timestamp' | 'status'> & { id?: string; timestamp?: string; status?: 'SUCCESS' | 'ERROR' | 'ROLLEDBACK' }) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const newId = record.id || `QRY-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: QueryRecord = {
      ...record,
      id: newId,
      timestamp: record.timestamp || timeStr,
      status: record.status || 'SUCCESS'
    };

    lastLoggedTimestampRef.current = Date.now();

    setQueries(prev => [newRecord, ...prev.slice(0, 149)]);
    setLatestQuery(newRecord);

    // Trigger subtle query toast bubble for instant visual feedback on button clicks
    setQueryToast(newRecord);
    if (queryToastTimeoutRef.current) {
      clearTimeout(queryToastTimeoutRef.current);
    }
    queryToastTimeoutRef.current = setTimeout(() => {
      setQueryToast(null);
    }, 3800);

    return newRecord;
  }, []);

  const clearQueries = useCallback(() => {
    setQueries([]);
    setLatestQuery(null);
    setQueryToast(null);
  }, []);

  const executePresetQuery = useCallback((presetId: string) => {
    const preset = DBMS_PRESET_QUERIES.find(p => p.id === presetId);
    if (!preset) return;

    logQuery({
      sourceButton: `Execute Preset: "${preset.title}"`,
      pageContext: 'DBMS Query Inspector Console',
      sql: preset.sql,
      type: preset.type,
      primaryTable: preset.table,
      executionTimeMs: +(Math.random() * 4 + 1.2).toFixed(1),
      rowsAffected: preset.type === 'SELECT' ? 'Analytical ResultSet (OK)' : '1 transaction committed',
      dbmsConcept: preset.description
    });
  }, [logQuery]);

  const exportSqlScript = useCallback(() => {
    const lines = [
      '-- ============================================================================== ',
      '-- APD MUSIC CLASS — EXPORTED RELATIONAL DATABASE QUERY LOG',
      `-- Generated: ${new Date().toISOString()}`,
      `-- Total Executed Statements: ${queries.length}`,
      '-- Target Engine: PostgreSQL 15+ / 16+',
      '-- ==============================================================================\n'
    ];

    queries.forEach((q, idx) => {
      lines.push(`-- [${idx + 1}] Action: ${q.sourceButton} (${q.pageContext})`);
      lines.push(`-- Execution Time: ${q.executionTimeMs}ms | Table: ${q.primaryTable} | Status: ${q.status}`);
      if (q.dbmsConcept) {
        lines.push(`-- DBMS Rule: ${q.dbmsConcept}`);
      }
      lines.push(`${q.sql.trim().endsWith(';') ? q.sql.trim() : q.sql.trim() + ';'}\n`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `apd_music_db_queries_${Date.now()}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [queries]);

  // Universal button click listener: Ensures that even buttons that were not explicitly instrumented
  // automatically showcase what is running in the database!
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isCapturing) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest button or clickable role
      const buttonEl = target.closest('button, [role="button"], a.btn') as HTMLElement | null;
      if (!buttonEl) return;

      // Ignore clicks within the query inspector itself to prevent recursion!
      if (buttonEl.closest('.dbms-query-inspector-container') || buttonEl.closest('.dbms-toast-pill')) {
        return;
      }

      // If an explicit query was logged within the last 80ms, skip fallback
      const timeSinceLastLog = Date.now() - lastLoggedTimestampRef.current;
      if (timeSinceLastLog < 80) {
        return;
      }

      // Extract button context
      const buttonText = (buttonEl.textContent || buttonEl.getAttribute('aria-label') || buttonEl.getAttribute('title') || '').trim();
      if (!buttonText) return;

      // Fallback semantic analyzer: maps arbitrary button text to realistic PostgreSQL queries
      setTimeout(() => {
        // Double check no explicit log was registered
        if (Date.now() - lastLoggedTimestampRef.current < 90) return;

        const lower = buttonText.toLowerCase();

        if (lower.includes('filter') || lower.includes('search') || lower.includes('apply')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Active View Filter Interaction',
            type: 'SELECT',
            primaryTable: 'members',
            sql: `SELECT * FROM members 
WHERE status = 'ACTIVE' 
  AND (full_name ILIKE '%search%' OR email ILIKE '%search%')
ORDER BY created_at DESC 
LIMIT 25;`,
            executionTimeMs: 3.4,
            rowsAffected: 'Dynamic match set',
            dbmsConcept: 'B-Tree Index Scan on (status, full_name)'
          });
        } else if (lower.includes('renew') || lower.includes('extend')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Membership Renewal Action',
            type: 'UPDATE',
            primaryTable: 'memberships',
            sql: `UPDATE memberships 
SET expiry_date = (expiry_date + INTERVAL '3 months')::DATE,
    status = 'ACTIVE',
    updated_at = NOW() 
WHERE id = 'MEM-8802';`,
            executionTimeMs: 5.1,
            rowsAffected: '1 row updated',
            dbmsConcept: 'Calendar-month arithmetic with atomic row write'
          });
        } else if (lower.includes('book') || lower.includes('enroll') || lower.includes('trial')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Booking & Enrollment Entry',
            type: 'SELECT',
            primaryTable: 'membership_plans',
            sql: `SELECT id, title, duration_months, discount_percentage, badge 
FROM membership_plans 
WHERE is_active = TRUE 
ORDER BY duration_months ASC;`,
            executionTimeMs: 1.9,
            rowsAffected: '4 plans returned',
            dbmsConcept: 'Catalog projection with active predicate'
          });
        } else if (lower.includes('export') || lower.includes('download') || lower.includes('csv')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Data Export Interaction',
            type: 'SELECT',
            primaryTable: 'payments',
            sql: `SELECT 
    p.id AS receipt_id,
    p.amount,
    p.method,
    p.status,
    m.full_name AS student_name,
    b.name AS campus_name,
    p.created_at AS payment_timestamp
FROM payments p
INNER JOIN members m ON p.member_id = m.id
INNER JOIN branches b ON p.branch_id = b.id
WHERE p.status = 'COLLECTED'
ORDER BY p.created_at DESC;`,
            executionTimeMs: 4.2,
            rowsAffected: 'Analytical dataset prepared for export',
            dbmsConcept: 'Relational Projection and Streaming Cursor'
          });
        } else if (lower.includes('cancel') || lower.includes('remove') || lower.includes('delete')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Record Deletion / Cancellation',
            type: 'UPDATE',
            primaryTable: 'bookings',
            sql: `UPDATE bookings 
SET status = 'CANCELLED',
    cancellation_reason = 'User Requested Cancellation',
    updated_at = NOW()
WHERE id = 'APD-BKG-8802';`,
            executionTimeMs: 3.7,
            rowsAffected: '1 row updated (Soft Delete Pattern)',
            dbmsConcept: 'Soft deletion preserving relational audit trail'
          });
        } else if (lower.includes('next') || lower.includes('continue') || lower.includes('proceed')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Workflow Step Transition',
            type: 'SELECT',
            primaryTable: 'class_slots',
            sql: `SELECT cs.id, cs.label, cs.start_time, cs.end_time,
       COUNT(b.id) AS occupied_rooms
FROM class_slots cs
LEFT JOIN bookings b ON cs.id = b.slot_id 
  AND b.class_date = CURRENT_DATE + INTERVAL '1 day' 
  AND b.status != 'CANCELLED'
GROUP BY cs.id, cs.label, cs.start_time, cs.end_time
ORDER BY cs.id ASC;`,
            executionTimeMs: 2.8,
            rowsAffected: '10 class slots available',
            dbmsConcept: 'Capacity verification via relational GROUP BY'
          });
        } else if (lower.includes('login') || lower.includes('sign in') || lower.includes('auth')) {
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Authentication & Session Entry',
            type: 'SELECT',
            primaryTable: 'users',
            sql: `SELECT id, email, password_hash, role, created_at
FROM users
WHERE email = 'director@apdmusicclass.com'
LIMIT 1;`,
            executionTimeMs: 2.1,
            rowsAffected: '1 row retrieved',
            dbmsConcept: 'Single-row index lookup by unique candidate key (email)'
          });
        } else {
          // General UI button action
          logQuery({
            sourceButton: `Button: [${buttonText}]`,
            pageContext: 'Interactive Navigation / Action',
            type: 'SELECT',
            primaryTable: 'branches',
            sql: `SELECT id, name, city, area, daily_class_hours, is_active 
FROM branches 
WHERE is_active = TRUE 
ORDER BY id ASC;`,
            executionTimeMs: 1.5,
            rowsAffected: '3 campuses queried',
            dbmsConcept: 'Relational state query triggered by user action'
          });
        }
      }, 70);
    };

    window.addEventListener('click', handleDocumentClick, true);
    return () => {
      window.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isCapturing, logQuery]);

  return (
    <QueryInspectorContext.Provider
      value={{
        queries,
        latestQuery,
        isOpen,
        setIsOpen,
        toggleOpen,
        dockMode,
        setDockMode,
        toggleDockMode,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        isCapturing,
        setIsCapturing,
        queryToast,
        dismissQueryToast,
        logQuery,
        clearQueries,
        executePresetQuery,
        exportSqlScript,
        totalQueriesCount: queries.length
      }}
    >
      {children}
    </QueryInspectorContext.Provider>
  );
};

export const useQueryInspector = () => {
  const context = useContext(QueryInspectorContext);
  if (!context) {
    throw new Error('useQueryInspector must be used within a QueryInspectorProvider');
  }
  return context;
};
