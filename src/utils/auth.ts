import { auth } from '../config/firebase';
import { AuthenticationError } from '../middleware/errorHandler';

export const verifyToken = async (token: string) => {
  try {
    // Try to verify as ID token
    try {
      const decodedToken = await auth.verifyIdToken(token);
      return decodedToken;
    } catch (idTokenError) {
      // If ID token verification fails, try as custom token
      const userRecord = await auth.getUser(token);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
      };
    }
  } catch (error) {
    throw new AuthenticationError('Invalid token');
  }
};
