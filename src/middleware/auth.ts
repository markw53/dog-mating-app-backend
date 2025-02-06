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
      // Get the user ID from the token (assuming it's a custom token)
      const decodedToken = token.split('.')[0];
      const userRecord = await auth.getUser(decodedToken);

      req.user = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      };

      logger.info('User authenticated:', {
        uid: userRecord.uid,
        email: userRecord.email,
      });

      next();
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
