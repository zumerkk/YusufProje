/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */
import { Request, Response, NextFunction } from 'express';

// Custom error class
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle known API errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Supabase errors
  else if (error.message.includes('duplicate key value')) {
    statusCode = 409;
    message = 'Resource already exists';
  }
  else if (error.message.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }
  else if (error.message.includes('not found')) {
    statusCode = 404;
    message = 'Resource not found';
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = error.message;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle syntax errors
  else if (error instanceof SyntaxError) {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

  // Log error for debugging (in production, use proper logging service)
  if (statusCode >= 500) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('Client Error:', {
      message: error.message,
      url: req.url,
      method: req.method,
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  // Send error response
  const errorResponse: any = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = details || error.message;
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.url} not found`);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};