// Authentication & Role-Based Authorization Middleware for APD MUSIC CLASS

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../config/constants';

export const JWT_SECRET = process.env.JWT_SECRET || 'apd-music-class-secret-jwt-key-2026';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
  memberId?: string;
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export function generateToken(payload: AuthenticatedUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // For ease of testing in Phase 2, also check for x-demo-role header if provided
    const demoRole = req.headers['x-demo-role'] as string;
    if (demoRole === 'OWNER') {
      req.user = {
        id: 'USR-O-001',
        email: 'director@apdmusicclass.com',
        role: 'OWNER',
        fullName: 'Dr. Alok Prasad'
      };
      return next();
    }
    if (demoRole === 'CLIENT') {
      req.user = {
        id: 'USR-C-101',
        email: 'aarav.patel@example.com',
        role: 'CLIENT',
        memberId: 'APD-M-1001',
        fullName: 'Aarav Patel'
      };
      return next();
    }
    return next(new UnauthorizedError('Missing Authorization header'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Invalid Authorization header format. Expected "Bearer <token>"'));
  }

  const token = parts[1];

  // Also support convenient demo tokens
  if (token === 'demo-owner-token') {
    req.user = {
      id: 'USR-O-001',
      email: 'director@apdmusicclass.com',
      role: 'OWNER',
      fullName: 'Dr. Alok Prasad'
    };
    return next();
  }

  if (token === 'demo-client-token') {
    req.user = {
      id: 'USR-C-101',
      email: 'aarav.patel@example.com',
      role: 'CLIENT',
      memberId: 'APD-M-1001',
      fullName: 'Aarav Patel'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Requires one of [${allowedRoles.join(', ')}] role privileges.`
        )
      );
    }

    next();
  };
}

export const requireOwner = requireRole(['OWNER']);
export const requireClient = requireRole(['CLIENT']);
export const requireAnyRole = requireRole(['CLIENT', 'OWNER']);
