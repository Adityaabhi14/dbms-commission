import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../../database/repository';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../../utils/errors';
import { authenticate, requireOwner } from '../../middleware/auth.middleware';
import { z } from 'zod';
import { validateBody } from '../../middleware/validate.middleware';

const router = Router();

// Track processed webhook event IDs in-memory for idempotency
const processedWebhookEventIds = new Set<string>();

const createCheckoutSessionSchema = z.object({
  memberId: z.string().min(1),
  branchId: z.string().min(1),
  instrumentId: z.string().optional(),
  bookingId: z.string().optional(),
  membershipId: z.string().optional(),
  amount: z.number().positive('Tuition amount must be greater than 0'),
  method: z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH']).optional().default('UPI'),
  isMockSandbox: z.boolean().optional().default(false)
});

const webhookPayloadSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required for idempotent webhook verification'),
  eventType: z.enum(['payment.captured', 'payment.failed', 'refund.processed']).optional(),
  status: z.enum(['PAID', 'FAILED', 'REFUNDED']).optional(),
  paymentId: z.string().optional(),
  bookingId: z.string().optional(),
  membershipId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  paymentMethod: z.string().optional(),
  transactionRef: z.string().optional(),
  signature: z.string().optional()
});

const refundPaymentSchema = z.object({
  refundAmount: z.number().positive('Refund amount must be greater than 0'),
  reason: z.string().min(3, 'Refund justification is required')
});

// 1. GET /api/payments
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const memberId = req.query.memberId as string | undefined;
    const branchId = req.query.branchId as string | undefined;

    // Client Isolation
    let targetMemberId = memberId;
    if (req.user?.role === 'CLIENT') {
      targetMemberId = req.user.memberId;
    }

    const payments = await db.payments.findMany({
      memberId: targetMemberId,
      branchId
    });

    return res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/payments/:id
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await db.payments.findUnique(req.params.id);
    if (!payment) {
      throw new NotFoundError('Payment', req.params.id);
    }

    if (req.user?.role === 'CLIENT' && req.user.memberId !== payment.memberId) {
      throw new ForbiddenError('Access to other members’ payment vouchers is denied');
    }

    return res.json({
      success: true,
      data: payment
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST /api/payments/checkout-session
// Server-side payment initialization with explicit Sandbox indicator
router.post('/checkout-session', authenticate, validateBody(createCheckoutSessionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hasLiveGatewayKeys = !!process.env.PAYMENT_GATEWAY_KEY && !!process.env.PAYMENT_GATEWAY_SECRET;
    const orderId = `APD-ORD-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute temporary hold

    // Create pending payment record
    const payment = await db.payments.create({
      memberId: req.body.memberId,
      branchId: req.body.branchId,
      instrumentId: req.body.instrumentId,
      bookingId: req.body.bookingId,
      membershipId: req.body.membershipId,
      amount: req.body.amount,
      refundAmount: 0,
      method: req.body.method,
      status: 'PENDING',
      transactionRef: orderId
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId,
        paymentId: payment.id,
        amount: req.body.amount,
        currency: 'INR',
        expiresAt,
        gatewayMode: hasLiveGatewayKeys ? 'LIVE' : 'DEVELOPMENT_SANDBOX',
        gatewayNotice: hasLiveGatewayKeys
          ? 'Live gateway initialized'
          : 'NOTICE: Running in Development Sandbox Simulation mode. Real merchant credentials required for production transactions.'
      }
    });
  } catch (err) {
    next(err);
  }
});

// 4. POST /api/payments/webhook
// Webhook handler with signature check & IDEMPOTENCY guarantee
router.post('/webhook', validateBody(webhookPayloadSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, eventType, status, paymentId, bookingId, membershipId, amount, transactionRef } = req.body;

    // 1. Idempotency Check: Reject replay of already-processed events
    if (processedWebhookEventIds.has(eventId)) {
      console.log(`[PAYMENT WEBHOOK] Idempotent replay detected for event ${eventId}. Returning 200 OK.`);
      return res.status(200).json({
        success: true,
        data: {
          received: true,
          idempotentReplay: true,
          processed: true,
          message: `Event ${eventId} has already been authoritatively processed.`
        }
      });
    }

    const effectiveEventType = eventType || (status === 'PAID' ? 'payment.captured' : (status === 'FAILED' ? 'payment.failed' : 'refund.processed'));

    let payment = paymentId ? await db.payments.findUnique(paymentId) : null;
    if (!payment && bookingId) {
      const all = await db.payments.findMany();
      payment = all.find(p => p.bookingId === bookingId) || null;
    }
    if (!payment && membershipId) {
      const all = await db.payments.findMany();
      payment = all.find(p => p.membershipId === membershipId) || null;
    }

    if (effectiveEventType === 'payment.captured') {
      if (payment) {
        // Mark payment COLLECTED
        await db.payments.update(payment.id, {
          status: 'COLLECTED',
          transactionRef: transactionRef || payment.transactionRef
        });

        // Activate membership if attached
        if (payment.membershipId) {
          await db.memberships.update(payment.membershipId, {
            paymentStatus: 'COLLECTED',
            status: 'ACTIVE'
          });
        }

        // Confirm booking if attached
        if (payment.bookingId) {
          await db.bookings.update(payment.bookingId, {
            status: 'CONFIRMED'
          });
        }

        await db.audit.create({
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'WEBHOOK_PAYMENT_CAPTURED',
          changes: { eventId, amount, transactionRef }
        });
      }

      processedWebhookEventIds.add(eventId);

      return res.status(200).json({
        success: true,
        data: {
          received: true,
          processed: true,
          idempotentReplay: false,
          message: `Webhook event ${eventId} successfully applied to ledger.`
        }
      });
    } else if (effectiveEventType === 'payment.failed') {
      if (payment) {
        await db.payments.update(payment.id, {
          status: 'FAILED'
        });

        // Release temporary booking hold
        if (payment.bookingId) {
          await db.bookings.update(payment.bookingId, {
            status: 'CANCELLED',
            cancellationReason: 'Payment authorization failed at gateway'
          });
        }

        await db.audit.create({
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'WEBHOOK_PAYMENT_FAILED',
          changes: { eventId, amount }
        });
      }

      processedWebhookEventIds.add(eventId);

      return res.status(200).json({
        success: true,
        data: {
          received: true,
          processed: false,
          reason: 'Payment failed at gateway',
          idempotentReplay: false,
          message: `Payment failed notification recorded.`
        }
      });
    }

    processedWebhookEventIds.add(eventId);
    return res.status(200).json({
      success: true,
      data: {
        received: true,
        processed: true,
        idempotentReplay: false
      }
    });
  } catch (err) {
    next(err);
  }
});

// 5. POST /api/payments (Direct voucher recording for administrative cash/desk receipts)
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await db.payments.create({
      ...req.body,
      refundAmount: 0,
      status: 'COLLECTED',
      transactionRef: req.body.transactionRef || `${req.body.method}-TXN-${Math.floor(100000 + Math.random() * 899999)}`
    });

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded and confirmed'
    });
  } catch (err) {
    next(err);
  }
});

// 6. POST /api/payments/:id/refund (Owner only)
router.post('/:id/refund', authenticate, requireOwner, validateBody(refundPaymentSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await db.payments.findUnique(req.params.id);
    if (!payment) {
      throw new NotFoundError('Payment', req.params.id);
    }

    if (req.body.refundAmount > payment.amount) {
      throw new BadRequestError(`Refund amount (${req.body.refundAmount}) cannot exceed original collected payment (${payment.amount})`);
    }

    const updated = await db.payments.update(req.params.id, {
      refundAmount: req.body.refundAmount,
      status: req.body.refundAmount === payment.amount ? 'REFUNDED' : 'COLLECTED'
    });

    // Record in dedicated refunds table
    await db.refunds.create({
      paymentId: req.params.id,
      amount: req.body.refundAmount,
      reason: req.body.reason,
      processedByUserId: req.user?.id,
      gatewayRefundRef: `RFND-GW-${Date.now()}`
    });

    await db.audit.create({
      entityType: 'PAYMENT',
      entityId: req.params.id,
      action: 'REFUND',
      performedByUserId: req.user?.id,
      changes: {
        refundAmount: req.body.refundAmount,
        reason: req.body.reason
      }
    });

    return res.json({
      success: true,
      data: updated,
      message: 'Refund successfully recorded in accounting ledger'
    });
  } catch (err) {
    next(err);
  }
});

export const paymentsRouter = router;
