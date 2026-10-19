import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../database/repository';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.middleware';

const router = Router();

const createExpenseSchema = z.object({
  title: z.string().min(2),
  category: z.enum([
    'STUDIO_RENT',
    'TEACHER_COMPENSATION',
    'EQUIPMENT_MAINTENANCE',
    'UTILITIES_ACOUSTIC_TECH',
    'MARKETING',
    'OTHER_OPERATIONAL'
  ]),
  branchId: z.string().min(1),
  instrumentId: z.string().optional(),
  amount: z.number().positive(),
  vendor: z.string().min(1),
  date: z.string().optional()
});

// GET /api/expenses (Owner only)
router.get('/', authenticate, requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branchId = req.query.branchId as string | undefined;
    const category = req.query.category as any;

    const expenses = await db.expenses.findMany({ branchId, category });
    return res.json({
      success: true,
      data: expenses
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses (Owner only)
router.post('/', authenticate, requireOwner, validateBody(createExpenseSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await db.expenses.create({
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0],
      paymentStatus: 'PAID'
    });

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Expense ledger entry recorded successfully'
    });
  } catch (err) {
    next(err);
  }
});

export const expensesRouter = router;
