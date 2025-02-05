import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  logger.info('Firebase initialized successfully');

  // Log configuration (without sensitive data)
  logger.info('Firebase Config:', {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} catch (error) {
  logger.error('Firebase initialization error:', error);
  throw error;
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Optionally export the admin SDK if needed elsewhere
export const firebase = admin;
