import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/database/repository';

describe('Auth Guards & Multi-Branch Client Isolation Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  const OWNER_TOKEN = 'Bearer demo-owner-token';
  const CLIENT_TOKEN = 'Bearer demo-client-token'; // Maps to Aarav Patel (APD-MEM-001)

  it('should reject unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/members');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should allow Owner to view all members across all branches', async () => {
    const res = await request(app)
      .get('/api/members')
      .set('Authorization', OWNER_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should isolate Client so they only see their own member record', async () => {
    const res = await request(app)
      .get('/api/members')
      .set('Authorization', CLIENT_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Client must receive only their own record
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe('APD-M-1001');
    expect(res.body.data[0].fullName).toBe('Aarav Patel');
  });

  it('should deny Client access to executive financial reports with 403 Forbidden', async () => {
    const endpoints = [
      '/api/reports/overview',
      '/api/reports/revenue-expenses',
      '/api/reports/by-instrument',
      '/api/reports/by-branch',
      '/api/reports/membership-expiry',
      '/api/expenses'
    ];

    for (const endpoint of endpoints) {
      const res = await request(app)
        .get(endpoint)
        .set('Authorization', CLIENT_TOKEN);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
  });

  it('should allow Owner to view executive financial reports', async () => {
    const res = await request(app)
      .get('/api/reports/overview')
      .set('Authorization', OWNER_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.finance).toBeDefined();
    expect(res.body.data.finance.netProfit).toBeDefined();
  });

  it('should deny Client from modifying studio branch addresses', async () => {
    const res = await request(app)
      .patch('/api/branches/kokila/address')
      .set('Authorization', CLIENT_TOKEN)
      .send({ address: 'Unauthorized Address Change' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow Owner to update studio branch addresses', async () => {
    const newAddress = 'Kokila Prime Plaza, Beside Metro Pillar 114, Kokila, Hyderabad';
    const res = await request(app)
      .patch('/api/branches/kokila/address')
      .set('Authorization', OWNER_TOKEN)
      .send({ address: newAddress });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.address).toBe(newAddress);
  });
});
