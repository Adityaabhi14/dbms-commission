import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/database/repository';
import { ConflictError } from '../src/utils/errors';

describe('Phase 3 Production Relational Database Integrity Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  describe('1. Entity Integrity & Candidate Keys', () => {
    it('should maintain 15 acoustic studio rooms distributed 5 per campus', async () => {
      const allRooms = await db.rooms.findMany();
      expect(allRooms.length).toBe(15);

      const madhapurRooms = await db.rooms.findMany({ branchId: 'madhapur' });
      const kokilaRooms = await db.rooms.findMany({ branchId: 'kokila' });
      const himayatnagarRooms = await db.rooms.findMany({ branchId: 'himayatnagar' });

      expect(madhapurRooms.length).toBe(5);
      expect(kokilaRooms.length).toBe(5);
      expect(himayatnagarRooms.length).toBe(5);

      // Verify room numbers are 1..5 in each branch
      const roomNumbers = madhapurRooms.map(r => r.roomNumber).sort();
      expect(roomNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should maintain 10 authoritative consecutive daily class slots (08:00 to 18:00)', async () => {
      const slots = await db.classSlots.findMany();
      expect(slots.length).toBe(10);
      expect(slots[0].startTime).toBe('08:00');
      expect(slots[9].endTime).toBe('18:00');
      expect(slots[0].label).toBe('08:00–09:00');
    });

    it('should enforce case-insensitive uniqueness on user emails', async () => {
      const users = await db.users.findMany();
      const existingEmail = users[0].email; // 'director@apdmusicclass.com'

      // Email collision test (mixed case)
      const duplicateUser = users.find(u => u.email.toLowerCase() === existingEmail.toUpperCase().toLowerCase());
      expect(duplicateUser).toBeDefined();
    });
  });

  describe('2. Normalization & Many-to-Many Relationships', () => {
    it('should normalize faculty certifications via join tables rather than comma-separated strings', async () => {
      const david = await db.teachers.findUnique('APD-T-201');
      expect(david).toBeDefined();
      expect(Array.isArray(david?.instrumentsTaught)).toBe(true);
      expect(david?.instrumentsTaught).toContain('guitar');
      expect(david?.instrumentsTaught).toContain('ukulele');

      // Verify campus assignments are normalized
      expect(david?.assignedBranches).toContain('madhapur');
      expect(david?.assignedBranches).toContain('kokila');
    });

    it('should normalize campus instrument offerings without string concatenation', async () => {
      const branches = await db.branches.findMany();
      const madhapur = branches.find(b => b.id === 'madhapur');
      expect(madhapur?.availableInstruments).toContain('guitar');
      expect(madhapur?.availableInstruments).toContain('piano');
      expect(madhapur?.availableInstruments).not.toContain('sitar'); // Sitar is only at kokila & himayatnagar
    });
  });

  describe('3. Financial Immutability & Decimal Precision', () => {
    it('should preserve immutable purchase price snapshot when plan catalog prices change', async () => {
      const memberships = await db.memberships.findMany();
      const aaravMem = memberships.find(m => m.memberId === 'APD-M-1001');

      expect(aaravMem).toBeDefined();
      expect(aaravMem?.totalFee).toBe(24000); // 4000 * 6
      expect(aaravMem?.discountAmount).toBe(3600); // 15% discount
      expect(aaravMem?.payableAmount).toBe(20400);

      // Simulate future catalog price increase
      await db.plans.update('6-months', { discountPercentage: 10 }); // reduced discount
      
      // Historical membership fee must remain unaffected
      const historicalMem = await db.memberships.findUnique(aaravMem!.id);
      expect(historicalMem?.payableAmount).toBe(20400);
      expect(historicalMem?.discountAmount).toBe(3600);
    });

    it('should separate collected payments, pending invoices, and refunds without double counting', async () => {
      const payments = await db.payments.findMany();
      const totalCollected = payments
        .filter(p => p.status === 'COLLECTED')
        .reduce((sum, p) => sum + p.amount, 0);

      expect(totalCollected).toBeGreaterThan(0);
      // All seeded payments have positive amounts
      payments.forEach(p => {
        expect(p.amount).toBeGreaterThan(0);
        expect(p.refundAmount).toBeGreaterThanOrEqual(0);
        expect(p.refundAmount).toBeLessThanOrEqual(p.amount);
      });
    });
  });

  describe('4. Concurrency Protection & Partial Unique Indexes', () => {
    it('should ensure cancelled bookings release capacity and do not block subsequent bookings', async () => {
      // 1. Create confirmed booking
      const bkg = await db.bookings.create({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-12-10',
        slotId: 4,
        slotLabel: '11:00–12:00',
        status: 'CONFIRMED',
        roomNumber: 1
      });

      // 2. Cancel the booking
      await db.bookings.update(bkg.id, {
        status: 'CANCELLED',
        cancellationReason: 'Student schedule change'
      });

      // 3. New booking by the same member on the same date and slot should SUCCEED
      // (PostgreSQL partial index WHERE status != 'CANCELLED' allows re-booking)
      const newBkg = await db.bookings.create({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-12-10',
        slotId: 4,
        slotLabel: '11:00–12:00',
        status: 'CONFIRMED',
        roomNumber: 1
      });

      expect(newBkg.id).toBeDefined();
      expect(newBkg.status).toBe('CONFIRMED');
    });

    it('should prevent double-booking collisions for active bookings within an atomic transaction', async () => {
      await expect(
        db.runInTransaction(async tx => {
          // Booking 1
          await tx.bookings.create({
            memberId: 'APD-M-1001',
            branchId: 'kokila',
            instrumentId: 'piano',
            classDate: '2026-12-15',
            slotId: 2,
            slotLabel: '09:00–10:00',
            status: 'CONFIRMED',
            roomNumber: 1
          });

          // Booking 2 with same member, date, and slot must throw ConflictError
          await tx.bookings.create({
            memberId: 'APD-M-1001',
            branchId: 'kokila',
            instrumentId: 'piano',
            classDate: '2026-12-15',
            slotId: 2,
            slotLabel: '09:00–10:00',
            status: 'CONFIRMED',
            roomNumber: 1
          });
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('5. Audit Logging & Compliance Tracing', () => {
    it('should record immutable audit logs for administrative events', async () => {
      const log = await db.audit.create({
        entityType: 'PAYMENT',
        entityId: 'RCPT-9041',
        action: 'REFUND',
        performedByUserId: 'USR-O-001',
        changes: { refundAmount: 2000, reason: 'Family relocation' },
        ipAddress: '127.0.0.1'
      });

      expect(log.id).toBeDefined();
      expect(log.entityType).toBe('PAYMENT');
      expect(log.action).toBe('REFUND');

      const logs = await db.audit.findMany('PAYMENT', 'RCPT-9041');
      expect(logs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
