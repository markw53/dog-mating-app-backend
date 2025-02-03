import { Request, Response, NextFunction } from "express";
import { FirebaseError } from "firebase-admin";
import logger from "../utils/logger";
import constants from "../config/constants";

// Custom Error Classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Not authorized to perform this action") {
    super(403, message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(429, message);
    this.name = "RateLimitError";
  }
}

// Error Handler Middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Error:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user
  });

  // Handle Firebase Errors
  if (err instanceof FirebaseError) {
    return handleFirebaseError(err, res);
  }

  // Handle Custom App Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.name,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  }

  // Handle Validation Errors (e.g., from Joi)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
      code: "VALIDATION_ERROR"
    });
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
      code: "INVALID_TOKEN"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
      code: "TOKEN_EXPIRED"
    });
  }

  // Handle Multer Errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
      code: "FILE_UPLOAD_ERROR"
    });
  }

  // Default Error Response
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    code: "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// Firebase Error Handler
const handleFirebaseError = (err: FirebaseError, res: Response) => {
  switch (err.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
      return res.status(401).json({
        status: "error",
        message: constants.ERRORS.AUTH.INVALID_CREDENTIALS,
        code: err.code
      });

    case "auth/email-already-in-use":
      return res.status(409).json({
        status: "error",
        message: constants.ERRORS.AUTH.EMAIL_IN_USE,
        code: err.code
      });

    case "auth/id-token-expired":
      return res.status(401).json({
        status: "error",
        message: constants.ERRORS.AUTH.TOKEN_EXPIRED,
        code: err.code
      });

    case "auth/invalid-id-token":
      return res.status(401).json({
        status: "error",
        message: constants.ERRORS.AUTH.INVALID_TOKEN,
        code: err.code
      });

    default:
      return res.status(500).json({
        status: "error",
        message: "Firebase operation failed",
        code: err.code,
        ...(process.env.NODE_ENV === "development" && {
          details: err.message,
          stack: err.stack
        })
      });
  }
};

// Async Handler Wrapper
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Not Found Handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new NotFoundError("Route");
  next(error);
};

// Example usage in routes:
/*
router.get('/dogs/:id', asyncHandler(async (req, res) => {
  const dog = await getDog(req.params.id);
  if (!dog) {
    throw new NotFoundError('Dog');
  }
  res.json(dog);
}));
*/

// Example usage in controllers:
/*
export const createDog = async (req: Request, res: Response) => {
  try {
    // Validation
    if (!req.body.name) {
      throw new ValidationError('Dog name is required');
    }

    // Authorization
    if (!req.user.canCreateDog) {
      throw new AuthorizationError('Not authorized to create dogs');
    }

    // Rate limiting
    if (userExceededRateLimit(req.user.id)) {
      throw new RateLimitError('Too many dog creation attempts');
    }

    // ... rest of the logic
  } catch (error) {
    throw error; // Will be caught by errorHandler middleware
  }
};
*/
