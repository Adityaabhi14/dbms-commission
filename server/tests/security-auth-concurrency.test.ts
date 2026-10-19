import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/database/repository';
import { authService } from '../src/modules/auth/auth.service';

describe('Phase 4: Security, Authentication, RBAC & Concurrency Integrity Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  const OWNER_TOKEN = 'Bearer demo-owner-token';
  const CLIENT_TOKEN = 'Bearer demo-client-token'; // Aarav Patel (APD-M-1001)

  // 1. REGISTRATION & CASE-INSENSITIVE DUPLICATION
  describe('1. Registration & Enumeration Protections', () => {
    it('should register a new client successfully with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Tanvi Sharma',
          email: 'tanvi.sharma@example.com',
          phone: '9876501234',
          password: 'securePassword123',
          confirmPassword: 'securePassword123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('tanvi.sharma@example.com');
      expect(res.body.data.user.role).toBe('CLIENT');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject duplicate registration with exact email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Tanvi Sharma',
          email: 'tanvi.duplicate@example.com',
          phone: '9876501234',
          password: 'securePassword123',
          confirmPassword: 'securePassword123'
        });

      // Second registration with exact same email
      const duplicateRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Tanvi Sharma Duplicate',
          email: 'tanvi.duplicate@example.com',
          phone: '9876501234',
          password: 'securePassword123',
          confirmPassword: 'securePassword123'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should reject duplicate registration with different case (case-insensitive uniqueness)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Rohit Verma',
          email: 'rohit.verma@example.com',
          phone: '9876509876',
          password: 'securePassword123',
          confirmPassword: 'securePassword123'
        });

      // Upper-cased and mixed-cased variations
      const uppercaseRes = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Rohit Verma',
          email: 'ROHIT.VERMA@EXAMPLE.COM',
          phone: '9876509876',
          password: 'securePassword123',
          confirmPassword: 'securePassword123'
        });

      expect(uppercaseRes.status).toBe(409);
      expect(uppercaseRes.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should strictly prevent public client registration from acquiring OWNER role', async () => {
      const maliciousPayload: any = {
        fullName: 'Attacker Attempting Escalation',
        email: 'attacker@example.com',
        phone: '9876500000',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: 'OWNER' // Client attempts to supply OWNER role
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(maliciousPayload);

      expect(res.status).toBe(201);
      // Backend must strictly ignore supplied role and force CLIENT
      expect(res.body.data.user.role).toBe('CLIENT');

      // Verify in database that the user is not an OWNER
      const userInDb = await db.users.findUnique({ email: 'attacker@example.com' });
      expect(userInDb?.role).toBe('CLIENT');
    });
  });

  // 2. AUTHENTICATION & LOGIN ENUMERATION PROTECTIONS
  describe('2. Login & Enumeration Protections', () => {
    it('should return identical generic error messages for non-existent users and wrong passwords', async () => {
      // 1. Non-existent email
      const nonExistentRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user@apdmusic.com',
          password: 'someRandomPassword123'
        });

      expect(nonExistentRes.status).toBe(401);
      expect(nonExistentRes.body.error.message).toBe('Invalid email or password');

      // 2. Exists, but wrong password
      const wrongPassRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.patel@example.com',
          password: 'completelyWrongPassword'
        });

      expect(wrongPassRes.status).toBe(401);
      expect(wrongPassRes.body.error.message).toBe('Invalid email or password');
    });

    it('should authenticate client successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.patel@example.com',
          password: 'password123',
          role: 'CLIENT'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('aarav.patel@example.com');
      expect(res.body.data.user.role).toBe('CLIENT');
    });

    it('should authenticate owner successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'director@apdmusicclass.com',
          password: 'directorSecure2026',
          role: 'OWNER'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('OWNER');
    });
  });

  // 3. PASSWORD RESET LIFECYCLE
  describe('3. Password Change & Reset Lifecycle', () => {
    it('should safely process forgot-password requests without exposing account existence', async () => {
      // Known user
      const knownRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'aarav.patel@example.com' });

      expect(knownRes.status).toBe(200);
      expect(knownRes.body.data.message).toContain('instructions have been dispatched');

      // Unknown user receives identical response
      const unknownRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'ghost.user.doesnotexist@nowhere.com' });

      expect(unknownRes.status).toBe(200);
      expect(unknownRes.body.data.message).toBe(knownRes.body.data.message);
    });

    it('should reject reset-password with invalid or forged token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-nonexistent-token-1234567890',
          newPassword: 'newBrandNewPassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('invalid or has expired');
    });
  });

  // 4. RBAC & PERMISSION BOUNDARIES
  describe('4. RBAC & Privilege Boundaries', () => {
    it('should reject client attempting to create a teacher', async () => {
      const res = await request(app)
        .post('/api/teachers')
        .set('Authorization', CLIENT_TOKEN)
        .send({
          name: 'Unauthorized Teacher',
          email: 'fake.teacher@apd.com',
          phone: '9876543210',
          instrumentsTaught: ['piano'],
          assignedBranches: ['kokila'],
          availability: 'Full Time'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject client attempting to record an academy expense', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', CLIENT_TOKEN)
        .send({
          title: 'Unauthorized Party',
          category: 'MARKETING',
          branchId: 'kokila',
          amount: 50000,
          date: '2026-10-19',
          vendorOrRecipient: 'Malicious Client'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject client attempting to issue a payment refund', async () => {
      const res = await request(app)
        .post('/api/payments/RCPT-9041/refund')
        .set('Authorization', CLIENT_TOKEN)
        .send({
          refundAmount: 5000,
          reason: 'Client attempting self-refund'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow owner to issue a verified payment refund and update ledger', async () => {
      const res = await request(app)
        .post('/api/payments/RCPT-9041/refund')
        .set('Authorization', OWNER_TOKEN)
        .send({
          refundAmount: 20400,
          reason: 'Student relocated out of city'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REFUNDED');
      expect(res.body.data.refundAmount).toBe(20400);
    });
  });

  // 5. CONCURRENT BOOKING CONFLICT PROTECTION (RACE CONDITIONS)
  describe('5. Concurrency & Collision Prevention', () => {
    it('should prevent simultaneous race conditions for the exact same class slot & room', async () => {
      const classDate = '2026-12-15';
      const slotId = 3; // 10:00 - 11:00
      const branchId = 'kokila';
      const instrumentId = 'piano';

      // Launch two simultaneous booking requests at the exact same millisecond
      const [resA, resB] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .set('Authorization', CLIENT_TOKEN)
          .send({
            memberId: 'APD-M-1001',
            branchId,
            instrumentId,
            teacherId: 'APD-T-202',
            classDate,
            slotId
          }),
        request(app)
          .post('/api/bookings')
          .set('Authorization', OWNER_TOKEN)
          .send({
            memberId: 'APD-M-1002',
            branchId,
            instrumentId,
            teacherId: 'APD-T-202', // Same teacher and same time slot
            classDate,
            slotId
          })
      ]);

      const statuses = [resA.status, resB.status];
      // Exactly one must succeed (201 Created) and the other must be rejected (409 Conflict)
      expect(statuses).toContain(201);
      expect(statuses).toContain(409);

      const conflictRes = resA.status === 409 ? resA : resB;
      expect(conflictRes.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should reject booking request with invalid instrument ID', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', CLIENT_TOKEN)
        .send({
          memberId: 'APD-M-1001',
          branchId: 'kokila',
          instrumentId: 'electric_synthesizer_unsupported', // Invalid
          classDate: '2026-12-16',
          slotId: 4
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should reject booking request with invalid branch ID', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', CLIENT_TOKEN)
        .send({
          memberId: 'APD-M-1001',
          branchId: 'delhi_central', // Unsupported branch
          instrumentId: 'piano',
          classDate: '2026-12-16',
          slotId: 4
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  // 6. PAYMENT WEBHOOK IDEMPOTENCY & REPLAY ATTACK MITIGATION
  describe('6. Authoritative Payment Webhook & Idempotency', () => {
    it('should handle payment webhook and be idempotent upon replay', async () => {
      const webhookPayload = {
        eventId: 'evt_test_payment_99881',
        membershipId: 'MEM-KOK-101',
        bookingId: 'APD-BKG-8801',
        amount: 8500,
        currency: 'INR',
        status: 'PAID' as const,
        paymentMethod: 'UPI'
      };

      // First delivery of webhook
      const firstRes = await request(app)
        .post('/api/payments/webhook')
        .send(webhookPayload);

      expect(firstRes.status).toBe(200);
      expect(firstRes.body.success).toBe(true);
      expect(firstRes.body.data.processed).toBe(true);

      // Replay delivery of exact same webhook (e.g. gateway network retry)
      const replayRes = await request(app)
        .post('/api/payments/webhook')
        .send(webhookPayload);

      // Must succeed without duplicate processing
      expect(replayRes.status).toBe(200);
      expect(replayRes.body.success).toBe(true);
      expect(replayRes.body.data.idempotentReplay).toBe(true);
    });

    it('should handle failed payment webhook safely without activating membership', async () => {
      const failPayload = {
        eventId: 'evt_test_payment_fail_1122',
        membershipId: 'MEM-KOK-102',
        amount: 5000,
        currency: 'INR',
        status: 'FAILED' as const,
        paymentMethod: 'CARD'
      };

      const res = await request(app)
        .post('/api/payments/webhook')
        .send(failPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.processed).toBe(false);
      expect(res.body.data.reason).toBe('Payment failed at gateway');
    });
  });

  // 7. FINANCIAL REPORTING CONSISTENCY AUDIT
  describe('7. Executive Financial Reporting Mathematical Consistency', () => {
    it('should ensure net operating profit equals recognized revenue minus recorded expenses and excludes pending payments', async () => {
      // Create a pending payment to rigorously test outstanding revenue isolation
      await db.payments.create({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        amount: 15000,
        refundAmount: 0,
        status: 'PENDING',
        transactionRef: 'PENDING-TEST-REF'
      });

      const res = await request(app)
        .get('/api/reports/overview')
        .set('Authorization', OWNER_TOKEN);

      expect(res.status).toBe(200);
      const fin = res.body.data.finance;

      // Net profit MUST strictly equal recognizedRevenue - totalRecordedExpenses
      expect(fin.netProfit).toBe(fin.recognizedRevenue - fin.totalRecordedExpenses);

      // Outstanding pending payments MUST be isolated and NOT included in recognized revenue
      expect(fin.outstandingPendingPayments).toBeGreaterThanOrEqual(15000);
      expect(fin.recognizedRevenue).not.toBe(fin.grossRevenueBilled);
      expect(fin.grossRevenueBilled).toBe(fin.collectedPayments + fin.outstandingPendingPayments);
    });
  });
});
