import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/database/repository';

describe('Transactional Booking Engine & Conflict Protection Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  const OWNER_TOKEN = 'Bearer demo-owner-token';
  const CLIENT_TOKEN = 'Bearer demo-client-token'; // Maps to Aarav Patel (APD-M-1001)

  it('should successfully create a valid class booking within 08:00–18:00 slots', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        teacherId: 'APD-T-202',
        classDate: '2026-11-20',
        slotId: 4 // 11:00 - 12:00
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.slotLabel).toBe('11:00–12:00');
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('should reject bookings outside the 10 daily academy slots (slot 0 or slot 11)', async () => {
    const resUnder = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-11-20',
        slotId: 0
      });

    expect([400, 422]).toContain(resUnder.status);

    const resOver = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-11-20',
        slotId: 11
      });

    expect([400, 422]).toContain(resOver.status);
  });

  it('should detect and reject double-booking conflicts for the same member on the same date and slot', async () => {
    // 1st booking
    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-11-22',
        slotId: 5 // 12:00 - 13:00
      });
    expect(first.status).toBe(201);

    // Duplicate booking for same member, date, and slot
    const duplicate = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        classDate: '2026-11-22',
        slotId: 5
      });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.success).toBe(false);
    expect(duplicate.body.error.code).toBe('CONFLICT_ERROR');
    expect(duplicate.body.error.message).toContain('already has an active booking');
  });

  it('should detect and reject teacher double-booking on the same date and slot', async () => {
    // First member books Teacher APD-T-202 on 2026-11-23 at slot 6
    const first = await request(app)
      .post('/api/bookings')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        memberId: 'APD-M-1001',
        branchId: 'kokila',
        instrumentId: 'piano',
        teacherId: 'APD-T-202',
        classDate: '2026-11-23',
        slotId: 6 // 13:00 - 14:00
      });
    expect(first.status).toBe(201);

    // Second member attempts to book same Teacher APD-T-202 at the same time
    const second = await request(app)
      .post('/api/bookings')
      .set('Authorization', OWNER_TOKEN)
      .send({
        memberId: 'APD-M-1002',
        branchId: 'kokila',
        instrumentId: 'piano',
        teacherId: 'APD-T-202',
        classDate: '2026-11-23',
        slotId: 6
      });

    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('CONFLICT_ERROR');
    expect(second.body.error.message).toContain('already assigned to class');
  });

  it('should enforce 24-hour advance notice rule for rescheduling', async () => {
    // Create a booking in the near future (e.g., 2 hours from now)
    const nearDate = new Date(Date.now() + 2 * 3600 * 1000); // 2 hours from now
    const nearDateStr = nearDate.toISOString().split('T')[0];

    const nearBooking = await db.bookings.create({
      memberId: 'APD-M-1001',
      branchId: 'kokila',
      instrumentId: 'piano',
      classDate: nearDateStr,
      slotId: 1, // 08:00 - 09:00
      slotLabel: '08:00–09:00',
      status: 'CONFIRMED',
      roomNumber: 1
    });

    const rescheduleRes = await request(app)
      .patch(`/api/bookings/${nearBooking.id}/reschedule`)
      .set('Authorization', CLIENT_TOKEN)
      .send({
        newClassDate: '2026-12-01',
        newSlotId: 2,
        reason: 'Last minute emergency'
      });

    expect(rescheduleRes.status).toBe(400);
    expect(rescheduleRes.body.error.message).toContain('at least 24 hours notice');
  });

  it('should allow rescheduling when notice is well in advance (>= 24 hours)', async () => {
    // APD-BKG-8801 is on 2026-10-25, which is well in advance
    const res = await request(app)
      .patch('/api/bookings/APD-BKG-8801/reschedule')
      .set('Authorization', CLIENT_TOKEN)
      .send({
        newClassDate: '2026-11-28',
        newSlotId: 7,
        reason: 'Traveling for exam'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.classDate).toBe('2026-11-28');
    expect(res.body.data.slotId).toBe(7);
    expect(res.body.data.slotLabel).toBe('14:00–15:00');
  });
});
