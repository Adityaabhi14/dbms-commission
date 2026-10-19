import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['CLIENT', 'OWNER']).optional().default('CLIENT')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.toLowerCase().trim())
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Valid reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
