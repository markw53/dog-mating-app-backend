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
      // For custom tokens, we need to verify them differently
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
      };
      next();
    } catch (verifyError) {
      // If ID token verification fails, try using the token as a user ID
      try {
        const userRecord = await auth.getUser(token);
        req.user = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        };
        next();
      } catch (userError) {
        logger.error('Token verification failed:', verifyError);
        logger.error('User lookup failed:', userError);
        throw new AuthenticationError('Invalid token');
      }
    }
  } catch (error) {
    next(error);
  }
};
