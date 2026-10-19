import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../database/repository';
import { NotFoundError } from '../../utils/errors';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/plans
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await db.plans.findMany();
    const instruments = await db.instruments.findMany();

    // Include calculated matrix by instrument & duration
    const enriched = plans.map(plan => {
      const pricingByInstrument: Record<string, { baseRate: number; rawSubtotal: number; discount: number; finalPrice: number }> = {};
      instruments.forEach(inst => {
        const rawSubtotal = inst.startingPricePerMonth * plan.durationMonths;
        const discount = Math.round(rawSubtotal * (plan.discountPercentage / 100));
        const finalPrice = rawSubtotal - discount;
        pricingByInstrument[inst.id] = {
          baseRate: inst.startingPricePerMonth,
          rawSubtotal,
          discount,
          finalPrice
        };
      });

      return {
        ...plan,
        pricingByInstrument
      };
    });

    return res.json({
      success: true,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/plans (Owner only)
router.post('/', authenticate, requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, durationMonths, title, description, discountPercentage, badge } = req.body;
    if (!id || !durationMonths || !title) {
      return res.status(400).json({ success: false, error: { message: 'Missing required plan attributes' } });
    }

    const created = await db.plans.create({
      id,
      durationMonths: parseInt(durationMonths, 10),
      title,
      description: description || '',
      discountPercentage: parseFloat(discountPercentage || 0),
      badge,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      data: created,
      message: 'Membership plan created successfully'
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/plans/:id (Owner only)
router.patch('/:id', authenticate, requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await db.plans.update(req.params.id, req.body);
    return res.json({
      success: true,
      data: updated,
      message: 'Plan tier updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

export const plansRouter = router;
