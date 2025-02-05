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

    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      token,
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // In a real application, you would verify the password here
    const userRecord = await auth.getUserByEmail(email);

    // Get user data from Firestore
    const userDocSnapshot = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDocSnapshot.data();

    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.json({
      token,
      user: {
        id: userRecord.uid,
        ...userData,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw new AuthenticationError('Invalid email or password');
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userDocSnapshot = await db.collection('users').doc(req.user.uid).get();

    if (!userDocSnapshot.exists) {
      throw new ValidationError('User profile not found');
    }

    res.json({
      id: userDocSnapshot.id,
      ...userDocSnapshot.data(),
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name) updates.name = name;
    if (email) updates.email = email;

    // Update Firestore document
    await db.collection('users').doc(req.user.uid).update(updates);

    // Get updated document
    const updatedDocSnapshot = await db.collection('users').doc(req.user.uid).get();

    res.json({
      id: updatedDocSnapshot.id,
      ...updatedDocSnapshot.data(),
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

// Optional: Add password reset functionality
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    await auth.generatePasswordResetLink(email);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Password reset request error:', error);
    throw error;
  }
};

// Optional: Add email verification functionality
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    await auth.generateEmailVerificationLink(email);

    res.json({ message: 'Email verification link sent' });
  } catch (error) {
    logger.error('Email verification request error:', error);
    throw error;
  }
};
