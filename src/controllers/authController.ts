import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import logger from '../utils/logger';
import { AuthenticationError, ValidationError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required');
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email,
      name,
      createdAt: new Date(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Create ID token
    const customToken = await auth.createCustomToken(userRecord.uid);

    // Get the actual ID token
    const idToken = await auth.createCustomToken(userRecord.uid);

    // Log successful registration
    logger.info('User registered successfully', {
      userId: userRecord.uid,
      email: email,
    });

    res.status(201).json({
      token: idToken,
      user: {
        id: userRecord.uid,
        ...userData,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

export const exchangeToken = async (req: Request, res: Response) => {
  try {
    const { customToken } = req.body;

    if (!customToken) {
      throw new ValidationError('Custom token is required');
    }

    try {
      // Get user from custom token
      const decodedToken = await auth.verifyIdToken(customToken);

      // Create a new custom token
      const newToken = await auth.createCustomToken(decodedToken.uid);

      res.json({ token: newToken });
    } catch (error) {
      logger.error('Token exchange error:', error);
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    logger.error('Token exchange error:', error);
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    try {
      // Get user record from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);

      // Get user data from Firestore
      const userDocSnapshot = await db.collection('users').doc(userRecord.uid).get();

      if (!userDocSnapshot.exists) {
        throw new ValidationError('User profile not found');
      }

      const userData = userDocSnapshot.data();

      // Create custom token
      const customToken = await auth.createCustomToken(userRecord.uid);

      // In a real application, you would verify the password using Firebase Auth
      // and exchange the custom token for an ID token using the Firebase Client SDK
      const token = customToken;

      // Log successful login
      logger.info('User logged in successfully', {
        userId: userRecord.uid,
        email: email,
      });

      res.json({
        token,
        user: {
          id: userRecord.uid,
          ...userData,
        },
      });
    } catch (error) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new AuthenticationError('Invalid email or password');
      }
      throw error;
    }
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      throw new AuthenticationError('User not authenticated');
    }

    const userDocSnapshot = await db.collection('users').doc(req.user.uid).get();

    if (!userDocSnapshot.exists) {
      throw new ValidationError('User profile not found');
    }

    const userData = userDocSnapshot.data();

    // Log profile retrieval
    logger.info('User profile retrieved', {
      userId: req.user.uid,
    });

    res.json({
      id: userDocSnapshot.id,
      ...userData,
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      throw new AuthenticationError('User not authenticated');
    }

    const { name, email } = req.body;
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name) updates.name = name;
    if (email) {
      // Verify email is not already in use
      try {
        await auth.getUserByEmail(email);
        throw new ValidationError('Email already in use');
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          updates.email = email;
          // Update email in Firebase Auth
          await auth.updateUser(req.user.uid, { email });
        } else {
          throw error;
        }
      }
    }

    // Update Firestore document
    await db.collection('users').doc(req.user.uid).update(updates);

    // Get updated document
    const updatedDocSnapshot = await db.collection('users').doc(req.user.uid).get();

    if (!updatedDocSnapshot.exists) {
      throw new ValidationError('User profile not found');
    }

    // Log profile update
    logger.info('User profile updated', {
      userId: req.user.uid,
      updates: Object.keys(updates),
    });

    res.json({
      id: updatedDocSnapshot.id,
      ...updatedDocSnapshot.data(),
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Verify user exists
    await auth.getUserByEmail(email);

    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    // In a real application, you would send this link via email
    logger.info('Password reset requested', { email });

    res.json({
      message: 'Password reset email sent',
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists
      res.json({ message: 'If an account exists, a password reset email will be sent' });
      return;
    }
    throw error;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    // Verify user exists
    await auth.getUserByEmail(email);

    // Generate email verification link
    const verificationLink = await auth.generateEmailVerificationLink(email);

    // In a real application, you would send this link via email
    logger.info('Email verification requested', { email });

    res.json({
      message: 'Email verification link sent',
      verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined,
    });
  } catch (error) {
    logger.error('Email verification request error:', error);
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists
      res.json({ message: 'If an account exists, a verification email will be sent' });
      return;
    }
    throw error;
  }
};

// New method to refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      throw new AuthenticationError('User not authenticated');
    }

    const newToken = await auth.createCustomToken(req.user.uid);

    res.json({ token: newToken });
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

// New method to verify token
export const verifyToken = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      throw new AuthenticationError('User not authenticated');
    }

    res.json({
      valid: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
      },
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    throw error;
  }
};
