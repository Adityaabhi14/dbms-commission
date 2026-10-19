// Custom Application Error Hierarchy for APD MUSIC CLASS

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(statusCode: number, message: string, errorCode = 'API_ERROR', details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required. Please provide a valid token.') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied. You do not possess the required permissions.') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string | number) {
    const msg = id ? `${resource} with ID '${id}' was not found` : `${resource} not found`;
    super(404, msg, 'NOT_FOUND');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT_ERROR', details);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}
