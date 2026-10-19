import { z } from 'zod';
import { INSTRUMENT_IDS, BRANCH_IDS, MEMBERSHIP_DURATIONS } from '../../config/constants';

export const createMembershipSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  planId: z.enum(MEMBERSHIP_DURATIONS),
  instrumentId: z.enum(INSTRUMENT_IDS),
  branchId: z.enum(BRANCH_IDS),
  startDate: z.string().optional(),
  paymentMode: z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH']).optional().default('UPI')
});

export const renewMembershipSchema = z.object({
  planId: z.enum(MEMBERSHIP_DURATIONS),
  paymentMode: z.enum(['UPI', 'CARD', 'NET_BANKING', 'CASH']).optional().default('UPI')
});

export type CreateMembershipDto = z.infer<typeof createMembershipSchema>;
export type RenewMembershipDto = z.infer<typeof renewMembershipSchema>;
