export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRANSACTION' | 'DDL';

export interface QueryRecord {
  id: string;
  timestamp: string; // HH:mm:ss
  sourceButton: string; // e.g. "Confirm Slot Booking", "Renew Membership", "Add Faculty Mentor"
  pageContext: string; // e.g. "Booking Flow", "Owner Members", "Client Portal", "Auth"
  sql: string; // Formatted PostgreSQL statement
  type: QueryType;
  primaryTable: string; // e.g. "bookings", "memberships", "teachers", "payments"
  relatedTables?: string[]; // e.g. ["rooms", "class_slots"]
  params?: Record<string, any>;
  executionTimeMs: number; // e.g. 3.4
  rowsAffected?: number | string;
  isolationLevel?: string; // e.g. "READ COMMITTED", "SERIALIZABLE"
  dbmsConcept?: string; // e.g. "3NF Elimination of Transitive Dependencies", "Partial Unique Index Concurrency Guard"
  status: 'SUCCESS' | 'ERROR' | 'ROLLEDBACK';
}

export type DockMode = 'floating' | 'docked-right';
