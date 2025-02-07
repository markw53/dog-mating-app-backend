import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { FirebaseError } from 'firebase-admin/lib/utils/error';
import logger from '../utils/logger';
import constants from '../config/constants';

// Base Error Class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom Error Classes
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Route') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// Error Handler Middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | FirebaseError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.message, {
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  if (err instanceof AuthenticationError) {
    res.status(401).json({
      status: 'error',
      message: err.message,
      code: err.name,
    });
    return next();
  }

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.name,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return next();
  }

  // Handle Firebase Errors
  if (err instanceof FirebaseError) {
    handleFirebaseError(err, res);
    return next();
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'VALIDATION_ERROR',
    });
    return next();
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
    return next();
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
    return next();
  }

  // Default Error Response
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
  return next();
};

// Firebase Error Handler
const handleFirebaseError = (err: FirebaseError, res: Response) => {
  switch (err.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return res.status(401).json({
        status: 'error',
        message: constants.ERRORS.AUTH.INVALID_CREDENTIALS,
        code: err.code,
      });

    case 'auth/email-already-in-use':
      return res.status(409).json({
        status: 'error',
        message: constants.ERRORS.AUTH.EMAIL_IN_USE,
        code: err.code,
      });

    case 'auth/id-token-expired':
      return res.status(401).json({
        status: 'error',
        message: constants.ERRORS.AUTH.TOKEN_EXPIRED,
        code: err.code,
      });

    default:
      return res.status(500).json({
        status: 'error',
        message: 'Firebase operation failed',
        code: err.code,
        ...(process.env.NODE_ENV === 'development' && {
          details: err.message,
          stack: err.stack,
        }),
      });
  }
};

// Not Found Handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
};

// Async Handler Wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const setupErrorHandlers = () => {
  // Handle deprecation warnings
  process.on('warning', warning => {
    if (warning.name === 'DeprecationWarning') {
      if (warning.message.includes('punycode')) {
        return; // Ignore punycode deprecation
      }
      // Log other deprecation warnings
      console.warn(`Deprecation: ${warning.message}`);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
};
