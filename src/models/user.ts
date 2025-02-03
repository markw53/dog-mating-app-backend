import { firestore } from "firebase-admin";

export interface User {
  id: string;
  email: string;
  name: string;
  fcmToken?: string;
  createdAt: firestore.Timestamp | Date;
  updatedAt?: firestore.Timestamp | Date;
  photoURL?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    radius: number;
  };
}

export interface UserCreateDTO {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
}

export interface UserUpdateDTO {
  name?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  preferences?: {
    notifications?: boolean;
    emailUpdates?: boolean;
    radius?: number;
  };
}
