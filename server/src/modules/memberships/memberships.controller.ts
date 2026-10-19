import { Router, Request, Response, NextFunction } from 'express';
import { membershipsService } from './memberships.service';
import { createMembershipSchema, renewMembershipSchema } from './memberships.schema';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/memberships
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberId = req.query.memberId as string | undefined;
    const result = await membershipsService.getMemberships({ memberId }, req.user!);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/memberships
router.post(
  '/',
  authenticate,
  validateBody(createMembershipSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await membershipsService.createMembership(req.body, req.user!);
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Membership successfully enrolled and activated'
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/memberships/:id
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await membershipsService.getMembershipById(req.params.id, req.user!);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/memberships/:id/remaining-days
router.get('/:id/remaining-days', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await membershipsService.getRemainingDays(req.params.id, req.user!);
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/memberships/:id/renew
router.post(
  '/:id/renew',
  authenticate,
  validateBody(renewMembershipSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await membershipsService.renewMembership(req.params.id, req.body, req.user!);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

export const membershipsRouter = router;
