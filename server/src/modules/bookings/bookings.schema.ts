import { z } from 'zod';
import { INSTRUMENT_IDS, BRANCH_IDS } from '../../config/constants';

export const createBookingSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  branchId: z.enum(BRANCH_IDS),
  instrumentId: z.enum(INSTRUMENT_IDS),
  classDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  slotId: z.number().int().min(1).max(10, 'Slot ID must be between 1 and 10'),
  teacherId: z.string().optional(),
  membershipId: z.string().optional(),
  paymentMode: z.string().optional()
});

export const rescheduleBookingSchema = z.object({
  newClassDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  newSlotId: z.number().int().min(1).max(10, 'Slot ID must be between 1 and 10'),
  reason: z.string().optional()
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required')
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;
export type RescheduleBookingDto = z.infer<typeof rescheduleBookingSchema>;
export type CancelBookingDto = z.infer<typeof cancelBookingSchema>;
