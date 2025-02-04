import * as admin from 'firebase-admin';
import * as serviceAccount from '../../service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Add this to your firebase.ts
const verifyConfig = () => {
  console.log('Firebase Config:');
  console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('Private Key length:', process.env.FIREBASE_PRIVATE_KEY?.length);
  console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
};

verifyConfig();
