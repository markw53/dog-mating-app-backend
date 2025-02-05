import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { AuthenticationError } from './errorHandler';

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
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
