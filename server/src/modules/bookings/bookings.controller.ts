import { Router, Request, Response, NextFunction } from 'express';
import { bookingsService } from './bookings.service';
import {
  createBookingSchema,
  rescheduleBookingSchema,
  cancelBookingSchema
} from './bookings.schema';
import { validateBody } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { bookingRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

// GET /api/bookings
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberId = req.query.memberId as string | undefined;
    const branchId = req.query.branchId as string | undefined;
    const classDate = req.query.classDate as string | undefined;

    const bookings = await bookingsService.getBookings({ memberId, branchId, classDate }, req.user!);
    return res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
router.post(
  '/',
  authenticate,
  bookingRateLimiter,
  validateBody(createBookingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await bookingsService.createBooking(req.body, req.user!);
      return res.status(201).json({
        success: true,
        data: created,
        message: 'Class session booked successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/bookings/:id
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingsService.getBookingById(req.params.id, req.user!);
    return res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/reschedule
router.patch(
  '/:id/reschedule',
  authenticate,
  bookingRateLimiter,
  validateBody(rescheduleBookingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rescheduled = await bookingsService.rescheduleBooking(req.params.id, req.body, req.user!);
      return res.json({
        success: true,
        data: rescheduled,
        message: 'Class session rescheduled successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/bookings/:id/cancel
router.post(
  '/:id/cancel',
  authenticate,
  validateBody(cancelBookingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cancelled = await bookingsService.cancelBooking(req.params.id, req.body, req.user!);
      return res.json({
        success: true,
        data: cancelled,
        message: 'Class booking cancelled successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

export const bookingsRouter = router;
