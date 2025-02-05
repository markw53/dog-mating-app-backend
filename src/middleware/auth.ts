import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthenticationError } from './errorHandler';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        displayName?: string;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('No authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    try {
      // First try to verify as a custom token
      const userRecord = await auth.getUser(token.split('.')[0]);
      req.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };
      next();
    } catch (customTokenError) {
      try {
        // If custom token fails, try as ID token
        const decodedToken = await auth.verifyIdToken(token);
        const userRecord = await auth.getUser(decodedToken.uid);
        req.user = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        };
        next();
      } catch (idTokenError) {
        logger.error('Token verification failed:', {
          customTokenError,
          idTokenError,
        });
        throw new AuthenticationError('Invalid token');
      }
    }
  } catch (error) {
    next(error);
  }
};

// Optional: Add a middleware to verify admin status if needed
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      throw new AuthenticationError('User not authenticated');
    }

    const userRecord = await auth.getUser(req.user.uid);
    const customClaims = userRecord.customClaims || {};

    if (!customClaims.admin) {
      throw new AuthenticationError('Requires admin privileges');
    }

    next();
  } catch (error) {
    next(error);
  }
};
