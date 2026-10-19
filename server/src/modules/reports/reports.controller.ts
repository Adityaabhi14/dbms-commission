import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../database/repository';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';
import { calculateFinancialSummary } from '../../utils/financeUtils';
import { calculateRemainingDays } from '../../utils/dateUtils';
import { INSTRUMENT_IDS, BRANCH_IDS } from '../../config/constants';

const router = Router();

// All reporting endpoints require Owner authorization
router.use(authenticate, requireOwner);

// 1. GET /api/reports/overview
router.get('/overview', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [payments, expenses, members, teachers, bookings, branches] = await Promise.all([
      db.payments.findMany(),
      db.expenses.findMany(),
      db.members.findMany(),
      db.teachers.findMany(),
      db.bookings.findMany(),
      db.branches.findMany()
    ]);

    const financialSummary = calculateFinancialSummary({ payments, expenses });
    const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
    const activeTeachersCount = teachers.filter(t => t.isActive).length;
    const upcomingBookingsCount = bookings.filter(b => b.status === 'CONFIRMED').length;

    return res.json({
      success: true,
      data: {
        finance: financialSummary,
        metrics: {
          totalBranches: branches.length,
          activeMembers: activeMembersCount,
          totalMembers: members.length,
          activeTeachers: activeTeachersCount,
          totalTeachers: teachers.length,
          upcomingBookings: upcomingBookingsCount,
          totalBookings: bookings.length
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/reports/revenue-expenses
router.get('/revenue-expenses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string | undefined;

    const [payments, expenses] = await Promise.all([
      db.payments.findMany(branchId ? { branchId } : undefined),
      db.expenses.findMany(branchId ? { branchId } : undefined)
    ]);

    const summary = calculateFinancialSummary({ payments, expenses });

    // Detailed expense category breakdown
    const categoryTotals: Record<string, number> = {
      STUDIO_RENT: 0,
      TEACHER_COMPENSATION: 0,
      EQUIPMENT_MAINTENANCE: 0,
      UTILITIES_ACOUSTIC_TECH: 0,
      MARKETING: 0,
      OTHER_OPERATIONAL: 0
    };

    for (const exp of expenses) {
      if (categoryTotals[exp.category] !== undefined) {
        categoryTotals[exp.category] += exp.amount;
      } else {
        categoryTotals['OTHER_OPERATIONAL'] += exp.amount;
      }
    }

    return res.json({
      success: true,
      data: {
        financialSummary: summary,
        expenseBreakdownByCategory: categoryTotals,
        branchFiltered: branchId || 'ALL_BRANCHES',
        complianceNotice: summary.hasIncompleteTeacherCompensation
          ? 'NOTICE: No teacher compensation expenses are currently recorded in the ledger for this period. Net profit may be temporarily inflated.'
          : 'All operating cost categories, including teacher compensation, are recorded in the ledger.'
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/reports/by-instrument
router.get('/by-instrument', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [payments, expenses, members, bookings, instruments] = await Promise.all([
      db.payments.findMany(),
      db.expenses.findMany(),
      db.members.findMany(),
      db.bookings.findMany(),
      db.instruments.findMany()
    ]);

    const summary = calculateFinancialSummary({ payments, expenses });

    const report = instruments.map(inst => {
      const recognizedRevenue = summary.revenueByInstrument[inst.id] || 0;
      const enrolledCount = members.filter(m => m.enrolledInstrumentId === inst.id && m.status === 'ACTIVE').length;
      const bookingsCount = bookings.filter(b => b.instrumentId === inst.id && b.status !== 'CANCELLED').length;
      
      const instrumentExpenses = expenses
        .filter(e => e.instrumentId === inst.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const netInstrumentProfit = recognizedRevenue - instrumentExpenses;

      return {
        instrumentId: inst.id,
        name: inst.name,
        category: inst.category,
        recognizedRevenue,
        allocatedExpenses: instrumentExpenses,
        netProfit: netInstrumentProfit,
        activeStudents: enrolledCount,
        totalBookings: bookingsCount,
        startingPrice: inst.startingPricePerMonth
      };
    });

    // Sort descending by recognized revenue
    report.sort((a, b) => b.recognizedRevenue - a.recognizedRevenue);

    return res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/reports/by-branch
router.get('/by-branch', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [branches, payments, expenses, members, teachers, bookings] = await Promise.all([
      db.branches.findMany(),
      db.payments.findMany(),
      db.expenses.findMany(),
      db.members.findMany(),
      db.teachers.findMany(),
      db.bookings.findMany()
    ]);

    const report = branches.map(branch => {
      const branchPayments = payments.filter(p => p.branchId === branch.id);
      const branchExpenses = expenses.filter(e => e.branchId === branch.id);
      const branchSummary = calculateFinancialSummary({ payments: branchPayments, expenses: branchExpenses });

      const branchMembers = members.filter(m => m.branchId === branch.id);
      const branchTeachers = teachers.filter(t => t.assignedBranches.includes(branch.id));
      const branchBookings = bookings.filter(b => b.branchId === branch.id && b.status !== 'CANCELLED');

      // Daily capacity: 10 slots * 5 rooms = 50 classes / day
      const dailySlots = branch.classSlotsCount || 10;
      const approximateCapacity = dailySlots * 5 * 30; // 30-day capacity approx
      const utilizationRate = Math.min(100, Math.round((branchBookings.length / Math.max(1, approximateCapacity)) * 100));

      return {
        branchId: branch.id,
        name: branch.name,
        city: branch.city,
        address: branch.address,
        grossRevenue: branchSummary.grossRevenueBilled,
        collectedPayments: branchSummary.collectedPayments,
        totalRefunds: branchSummary.totalRefunds,
        recognizedRevenue: branchSummary.recognizedRevenue,
        totalExpenses: branchSummary.totalRecordedExpenses,
        netProfit: branchSummary.netProfit,
        profitMarginPercent: branchSummary.profitMarginPercent,
        activeMembers: branchMembers.filter(m => m.status === 'ACTIVE').length,
        assignedTeachers: branchTeachers.length,
        totalBookings: branchBookings.length,
        estimatedUtilizationPercent: utilizationRate
      };
    });

    // Rank branches by recognized revenue
    report.sort((a, b) => b.recognizedRevenue - a.recognizedRevenue);

    return res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET /api/reports/membership-expiry
router.get('/membership-expiry', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [memberships, members, plans, instruments] = await Promise.all([
      db.memberships.findMany(),
      db.members.findMany(),
      db.plans.findMany(),
      db.instruments.findMany()
    ]);

    const memberMap = new Map(members.map(m => [m.id, m]));
    const planMap = new Map(plans.map(p => [p.id, p]));
    const instrumentMap = new Map(instruments.map(i => [i.id, i]));

    const enrichedMemberships = memberships.map(m => {
      const member = memberMap.get(m.memberId);
      const plan = planMap.get(m.planId);
      const instrument = instrumentMap.get(m.instrumentId);
      const daysRemaining = calculateRemainingDays(m.expiryDate);

      return {
        membershipId: m.id,
        memberId: m.memberId,
        memberName: member?.fullName || 'Unknown',
        memberEmail: member?.email || '',
        memberPhone: member?.phone || '',
        instrumentName: instrument?.name || m.instrumentId,
        branchId: m.branchId,
        planTitle: plan?.title || `${m.planId} Months`,
        startDate: m.startDate,
        expiryDate: m.expiryDate,
        daysRemaining,
        status: m.status,
        payableAmount: m.payableAmount
      };
    });

    const expiringWithin7Days = enrichedMemberships.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 7);
    const expiringWithin15Days = enrichedMemberships.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 15);
    const expiringWithin30Days = enrichedMemberships.filter(m => m.daysRemaining >= 0 && m.daysRemaining <= 30);
    const alreadyExpired = enrichedMemberships.filter(m => m.daysRemaining < 0 || m.status === 'EXPIRED');

    return res.json({
      success: true,
      data: {
        summary: {
          totalMemberships: enrichedMemberships.length,
          expiringWithin7DaysCount: expiringWithin7Days.length,
          expiringWithin15DaysCount: expiringWithin15Days.length,
          expiringWithin30DaysCount: expiringWithin30Days.length,
          expiredCount: alreadyExpired.length
        },
        expiringWithin7Days,
        expiringWithin15Days,
        expiringWithin30Days,
        alreadyExpired
      }
    });
  } catch (err) {
    next(err);
  }
});

export const reportsRouter = router;
