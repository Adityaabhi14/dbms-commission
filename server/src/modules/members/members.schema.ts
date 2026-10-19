import { z } from 'zod';
import { INSTRUMENT_IDS, BRANCH_IDS } from '../../config/constants';

export const updateMemberSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  emergencyContact: z.string().optional(),
  notes: z.string().optional(),
  enrolledInstrumentId: z.enum(INSTRUMENT_IDS).optional(),
  branchId: z.enum(BRANCH_IDS).optional(),
  status: z.enum(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED', 'SUSPENDED']).optional()
});

export const memberFilterQuerySchema = z.object({
  search: z.string().optional(),
  branchId: z.string().optional(),
  instrumentId: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'daysRemaining', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;
export type MemberFilterQuery = z.infer<typeof memberFilterQuerySchema>;
