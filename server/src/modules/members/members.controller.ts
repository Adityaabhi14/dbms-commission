import { Router, Request, Response, NextFunction } from 'express';
import { membersService } from './members.service';
import { updateMemberSchema, memberFilterQuerySchema } from './members.schema';
import { validateBody, validateQuery } from '../../middleware/validate.middleware';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/members/expiring (Owner only) - Defined before :id to prevent path collision
router.get(
  '/expiring',
  authenticate,
  requireOwner,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const withinDays = req.query.withinDays ? parseInt(req.query.withinDays as string, 10) : 15;
      const result = await membersService.getExpiringMembers(withinDays);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/members (Owner sees all, Client isolated to self)
router.get(
  '/',
  authenticate,
  validateQuery(memberFilterQuerySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === 'CLIENT') {
        const selfMember = await membersService.getMemberById(req.user.memberId!, req.user);
        return res.json({
          success: true,
          data: [selfMember],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 }
        });
      }

      const result = await membersService.getMembers((req as any).validatedQuery || req.query);
      return res.json({
        success: true,
        data: result.members,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/members/:id (Owner or Self)
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await membersService.getMemberById(req.params.id, req.user!);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/members/:id (Owner or Self)
router.patch(
  '/:id',
  authenticate,
  validateBody(updateMemberSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Clients can only update their own phone/notes/emergencyContact
      if (req.user?.role === 'CLIENT' && req.user.memberId !== req.params.id) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      }

      const result = await membersService.updateMember(req.params.id, req.body);
      return res.json({
        success: true,
        data: result,
        message: 'Member updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

export const membersRouter = router;
