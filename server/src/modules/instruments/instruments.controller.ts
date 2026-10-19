import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../database/repository';
import { NotFoundError } from '../../utils/errors';

const router = Router();

// GET /api/instruments
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const instruments = await db.instruments.findMany();
    return res.json({
      success: true,
      data: instruments
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/instruments/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instrument = await db.instruments.findUnique(req.params.id);
    if (!instrument) {
      throw new NotFoundError('Instrument', req.params.id);
    }
    return res.json({
      success: true,
      data: instrument
    });
  } catch (err) {
    next(err);
  }
});

export const instrumentsRouter = router;
