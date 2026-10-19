import { z } from 'zod';
import { INSTRUMENT_IDS, BRANCH_IDS } from '../../config/constants';

export const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  instrumentsTaught: z.array(z.enum(INSTRUMENT_IDS)).min(1, 'Teacher must teach at least one instrument'),
  assignedBranches: z.array(z.enum(BRANCH_IDS)).min(1, 'Teacher must be assigned to at least one branch'),
  availability: z.enum(['Full Time', 'Part Time', 'Weekend Specialist']).optional().default('Full Time'),
  employmentStatus: z.enum(['Active', 'On Leave', 'Contract']).optional().default('Active'),
  joiningDate: z.string().optional(),
  bio: z.string().optional()
});

export const updateTeacherSchema = createTeacherSchema.partial();

export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;
