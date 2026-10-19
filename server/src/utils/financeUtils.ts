// Financial Accounting & Reporting Utilities for APD MUSIC CLASS
// Strictly implements: Net Profit = Recognized Revenue (Collected - Refunds) − Recorded Expenses

export interface FinancialCalculationInput {
  payments: Array<{
    id: string;
    amount: number;
    status: 'COLLECTED' | 'PENDING' | 'REFUNDED' | 'FAILED' | string;
    refundAmount?: number;
    branchId: string;
    instrumentId?: string;
    createdAt: Date | string;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    category: string;
    branchId: string;
    instrumentId?: string;
    createdAt: Date | string;
  }>;
}

export interface FinancialSummaryOutput {
  grossRevenueBilled: number;
  collectedPayments: number;
  outstandingPendingPayments: number;
  totalRefunds: number;
  recognizedRevenue: number;
  totalRecordedExpenses: number;
  operatingExpenses: number;
  teacherCompensation: number;
  netProfit: number;
  profitMarginPercent: number;
  hasIncompleteTeacherCompensation: boolean;
  revenueByInstrument: Record<string, number>;
  revenueByBranch: Record<string, number>;
  rankedInstruments: Array<{ instrumentId: string; recognizedRevenue: number }>;
  rankedBranches: Array<{ branchId: string; recognizedRevenue: number }>;
}

export function calculateFinancialSummary(input: FinancialCalculationInput): FinancialSummaryOutput {
  let collectedPayments = 0;
  let outstandingPendingPayments = 0;
  let totalRefunds = 0;

  const revenueByInstrument: Record<string, number> = {};
  const revenueByBranch: Record<string, number> = {};

  for (const p of input.payments) {
    if (p.status === 'COLLECTED' || p.status === 'Paid') {
      collectedPayments += p.amount;
      const ref = p.refundAmount || 0;
      totalRefunds += ref;

      const netFromPayment = p.amount - ref;
      if (p.instrumentId) {
        revenueByInstrument[p.instrumentId] = (revenueByInstrument[p.instrumentId] || 0) + netFromPayment;
      }
      if (p.branchId) {
        revenueByBranch[p.branchId] = (revenueByBranch[p.branchId] || 0) + netFromPayment;
      }
    } else if (p.status === 'PENDING' || p.status === 'Pending') {
      outstandingPendingPayments += p.amount;
    } else if (p.status === 'REFUNDED' || p.status === 'Refunded') {
      totalRefunds += p.amount;
    }
  }

  // Gross Revenue = Total Billed (Cash received + Awaiting collection)
  const grossRevenueBilled = collectedPayments + outstandingPendingPayments;

  // Recognized Revenue = Cash actually collected minus refunds
  const recognizedRevenue = collectedPayments - totalRefunds;

  let totalRecordedExpenses = 0;
  let teacherCompensation = 0;

  for (const e of input.expenses) {
    totalRecordedExpenses += e.amount;
    if (e.category === 'TEACHER_COMPENSATION' || e.category === 'Teacher Compensation') {
      teacherCompensation += e.amount;
    }
  }

  const operatingExpenses = totalRecordedExpenses - teacherCompensation;

  // Net Profit formula: Recognized Revenue - Recorded Expenses
  const netProfit = recognizedRevenue - totalRecordedExpenses;

  const profitMarginPercent = recognizedRevenue > 0
    ? Math.round((netProfit / recognizedRevenue) * 1000) / 10
    : 0;

  // Check if teacher compensation is recorded
  const hasIncompleteTeacherCompensation = teacherCompensation === 0 && recognizedRevenue > 0;

  const rankedInstruments = Object.entries(revenueByInstrument)
    .map(([instrumentId, revenue]) => ({ instrumentId, recognizedRevenue: revenue }))
    .sort((a, b) => b.recognizedRevenue - a.recognizedRevenue);

  const rankedBranches = Object.entries(revenueByBranch)
    .map(([branchId, revenue]) => ({ branchId, recognizedRevenue: revenue }))
    .sort((a, b) => b.recognizedRevenue - a.recognizedRevenue);

  return {
    grossRevenueBilled,
    collectedPayments,
    outstandingPendingPayments,
    totalRefunds,
    recognizedRevenue,
    totalRecordedExpenses,
    operatingExpenses,
    teacherCompensation,
    netProfit,
    profitMarginPercent,
    hasIncompleteTeacherCompensation,
    revenueByInstrument,
    revenueByBranch,
    rankedInstruments,
    rankedBranches
  };
}
