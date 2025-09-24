import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  status?: number;
  code?: string | number;
  errors?: any;
  isOperational?: boolean;
}

export class AppError extends Error implements CustomError {
  public status: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, status: number = 500, isOperational: boolean = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  logger.logApiError(req, err);
  
  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
    code: err.code || 'INTERNAL_ERROR'
  };

  // Supabase/PostgreSQL errors
  if (err.code === '23505') {
    error = {
      message: 'Duplicate entry. This record already exists.',
      status: 409,
      code: 'DUPLICATE_ENTRY'
    };
  }

  if (err.code === '23503') {
    error = {
      message: 'Foreign key constraint violation. Referenced record does not exist.',
      status: 400,
      code: 'FOREIGN_KEY_VIOLATION'
    };
  }

  if (err.code === '23502') {
    error = {
      message: 'Required field is missing.',
      status: 400,
      code: 'MISSING_REQUIRED_FIELD'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token. Please log in again.',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired. Please log in again.',
      status: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = {
      message: message || 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // Cast errors (invalid ID format)
  if (err.name === 'CastError') {
    error = {
      message: 'Invalid ID format',
      status: 400,
      code: 'INVALID_ID_FORMAT'
    };
  }

  // Permission errors
  if (err.message?.includes('permission denied') || err.message?.includes('access denied')) {
    error = {
      message: 'Access denied. You do not have permission to perform this action.',
      status: 403,
      code: 'ACCESS_DENIED'
    };
  }

  // Rate limiting errors
  if (err.message?.includes('rate limit')) {
    error = {
      message: 'Too many requests. Please try again later.',
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Network/Connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error = {
      message: 'Service temporarily unavailable. Please try again later.',
      status: 503,
      code: 'SERVICE_UNAVAILABLE'
    };
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
    error = {
      message: 'Request timeout. Please try again.',
      status: 408,
      code: 'REQUEST_TIMEOUT'
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File size too large. Maximum size allowed is 10MB.',
      status: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected file field or too many files.',
      status: 400,
      code: 'INVALID_FILE_UPLOAD'
    };
  }

  // Payment errors
  if (err.message?.includes('payment') || err.message?.includes('stripe')) {
    error = {
      message: 'Payment processing failed. Please try again or contact support.',
      status: 402,
      code: 'PAYMENT_FAILED'
    };
  }

  // Don't leak error details in production
  const response: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      status: error.status
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err;
  }

  // Include request ID for tracking
  if (req.headers['x-request-id']) {
    response.error.requestId = req.headers['x-request-id'];
  }

  res.status(error.status).json(response);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route not found - ${req.method} ${req.originalUrl}`, 404);
  
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });
  
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Generate request ID
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logApiRequest(req, res, duration);
  });
  
  next();
};

// Validation error helper
export const createValidationError = (field: string, message: string) => {
  return new AppError(`Validation failed for field '${field}': ${message}`, 400);
};

// Permission error helper
export const createPermissionError = (action: string, resource: string) => {
  return new AppError(`Permission denied: Cannot ${action} ${resource}`, 403);
};

// Not found error helper
export const createNotFoundError = (resource: string, id?: string) => {
  const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
  return new AppError(message, 404);
};