// Request Validation Middleware using Zod for APD MUSIC CLASS

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Invalid request body parameters', details));
      }
      next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      for (const key of Object.keys(req.query)) {
        delete (req.query as any)[key];
      }
      Object.assign(req.query, parsed);
      (req as any).validatedQuery = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Invalid query parameters', details));
      }
      next(err);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      for (const key of Object.keys(req.params)) {
        delete (req.params as any)[key];
      }
      Object.assign(req.params, parsed);
      (req as any).validatedParams = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Invalid URL route parameters', details));
      }
      next(err);
    }
  };
}
