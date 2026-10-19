import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { db } from '../src/database/repository';
import { calculateFinancialSummary } from '../src/utils/financeUtils';

describe('Financial Accounting & Net Profit Calculation Tests', () => {
  beforeEach(() => {
    db.resetToSeed();
  });

  const OWNER_TOKEN = 'Bearer demo-owner-token';

  it('should strictly implement Net Profit = Recognized Revenue (Collected - Refunds) - Recorded Expenses', () => {
    const summary = calculateFinancialSummary({
      payments: [
        { id: 'p1', amount: 10000, status: 'COLLECTED', refundAmount: 1000, branchId: 'madhapur', createdAt: new Date() },
        { id: 'p2', amount: 5000, status: 'PENDING', branchId: 'madhapur', createdAt: new Date() } // Not collected yet
      ],
      expenses: [
        { id: 'e1', amount: 3000, category: 'STUDIO_RENT', branchId: 'madhapur', createdAt: new Date() },
        { id: 'e2', amount: 2000, category: 'TEACHER_COMPENSATION', branchId: 'madhapur', createdAt: new Date() }
      ]
    });

    // Gross Revenue = Total billed (10000 + 5000 = 15000)
    expect(summary.grossRevenueBilled).toBe(15000);
    // Collected Payments = 10000
    expect(summary.collectedPayments).toBe(10000);
    // Outstanding Pending = 5000
    expect(summary.outstandingPendingPayments).toBe(5000);
    // Total Refunds = 1000
    expect(summary.totalRefunds).toBe(1000);
    // Recognized Revenue = 10000 - 1000 = 9000
    expect(summary.recognizedRevenue).toBe(9000);
    // Recorded Expenses = 3000 + 2000 = 5000
    expect(summary.totalRecordedExpenses).toBe(5000);
    // Net Profit = 9000 - 5000 = 4000
    expect(summary.netProfit).toBe(4000);
    // Profit margin = (4000 / 9000) * 100 = 44.4%
    expect(summary.profitMarginPercent).toBe(44.4);
    // Teacher compensation is present
    expect(summary.hasIncompleteTeacherCompensation).toBe(false);
  });

  it('should flag incomplete teacher compensation when teacher expenses are missing from the ledger', () => {
    const summary = calculateFinancialSummary({
      payments: [
        { id: 'p1', amount: 20000, status: 'COLLECTED', branchId: 'kokila', createdAt: new Date() }
      ],
      expenses: [
        { id: 'e1', amount: 5000, category: 'STUDIO_RENT', branchId: 'kokila', createdAt: new Date() }
        // No TEACHER_COMPENSATION recorded
      ]
    });

    expect(summary.teacherCompensation).toBe(0);
    expect(summary.hasIncompleteTeacherCompensation).toBe(true);
  });

  it('should deduct refunds via API and reflect immediately in financial reports', async () => {
    // 1. Check initial financial overview
    const initialReport = await request(app)
      .get('/api/reports/revenue-expenses')
      .set('Authorization', OWNER_TOKEN);
    expect(initialReport.status).toBe(200);
    const initialNetProfit = initialReport.body.data.financialSummary.netProfit;

    // 2. Issue a 2000 INR refund on payment RCPT-9041
    const refundRes = await request(app)
      .post('/api/payments/RCPT-9041/refund')
      .set('Authorization', OWNER_TOKEN)
      .send({
        refundAmount: 2000,
        reason: 'Family relocation adjustment'
      });
    expect(refundRes.status).toBe(200);
    expect(refundRes.body.data.refundAmount).toBe(2000);

    // 3. Verify that Net Profit in financial reports is reduced by exactly 2000
    const updatedReport = await request(app)
      .get('/api/reports/revenue-expenses')
      .set('Authorization', OWNER_TOKEN);
    const updatedNetProfit = updatedReport.body.data.financialSummary.netProfit;
    expect(updatedNetProfit).toBe(initialNetProfit - 2000);
  });

  it('should reject refunds that exceed original payment amount', async () => {
    // RCPT-9041 has an amount of 20400
    const res = await request(app)
      .post('/api/payments/RCPT-9041/refund')
      .set('Authorization', OWNER_TOKEN)
      .send({
        refundAmount: 999999,
        reason: 'Excessive refund test'
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('cannot exceed original collected payment');
  });

  it('should rank instrument profitability and branch performance in reports', async () => {
    const instRes = await request(app)
      .get('/api/reports/by-instrument')
      .set('Authorization', OWNER_TOKEN);

    expect(instRes.status).toBe(200);
    expect(Array.isArray(instRes.body.data)).toBe(true);
    // Highest revenue instrument should be first
    if (instRes.body.data.length > 1) {
      expect(instRes.body.data[0].recognizedRevenue).toBeGreaterThanOrEqual(instRes.body.data[1].recognizedRevenue);
    }

    const branchRes = await request(app)
      .get('/api/reports/by-branch')
      .set('Authorization', OWNER_TOKEN);

    expect(branchRes.status).toBe(200);
    expect(Array.isArray(branchRes.body.data)).toBe(true);
    expect(branchRes.body.data.length).toBe(3); // Madhapur, Kokila, Himayatnagar
  });
});
