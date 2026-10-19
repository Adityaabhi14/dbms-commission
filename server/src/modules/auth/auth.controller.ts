import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from './auth.schema';
import { validateBody } from '../../middleware/validate.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register (Client self-service only)
router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.registerClient(req.body);
      return res.status(201).json({
        success: true,
        data: result,
        message: 'Account successfully registered'
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      return res.json({
        success: true,
        data: result,
        message: 'Authentication successful'
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response) => {
    return res.json({
      success: true,
      data: req.user
    });
  }
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authenticate,
  authRateLimiter,
  validateBody(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.changePassword(req.user!.id, req.body);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/forgot-password (Enumeration-safe)
router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.forgotPassword(req.body);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(req.body);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
);

export const authRouter = router;
