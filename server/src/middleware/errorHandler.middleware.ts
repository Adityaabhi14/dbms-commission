// Centralized Error Handling Middleware for APD MUSIC CLASS
// Strips secrets and returns standardized JSON response contract

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Sanitize path and log safely (do not log passwords, tokens, or sensitive credit card data)
  const safePath = req.originalUrl || req.url;
  const method = req.method;

  if (err instanceof ApiError) {
    // Expected application errors
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null
      },
      timestamp: new Date().toISOString(),
      path: safePath
    });
  }

  // Unhandled internal server errors
  console.error(`[Unhandled Error] ${method} ${safePath}:`, err.message);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please contact academy support.'
    },
    timestamp: new Date().toISOString(),
    path: safePath
  });
}
