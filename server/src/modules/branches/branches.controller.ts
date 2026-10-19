import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../database/repository';
import { NotFoundError } from '../../utils/errors';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/branches
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const branches = await db.branches.findMany();
    return res.json({
      success: true,
      data: branches
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/branches/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const branch = await db.branches.findUnique(req.params.id);
    if (!branch) {
      throw new NotFoundError('Branch', req.params.id);
    }
    return res.json({
      success: true,
      data: branch
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/branches/:id/address (Owner only - allows configuring studio addresses like Kokila)
router.patch('/:id/address', authenticate, requireOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'Valid address string is required' } });
    }
    const updated = await db.branches.updateAddress(req.params.id, address);
    return res.json({
      success: true,
      data: updated,
      message: 'Branch address updated successfully'
    });
  } catch (err) {
    next(err);
  }
});

export const branchesRouter = router;
