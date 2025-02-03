import { Request, Response } from "express";
import { auth, db } from "../config/firebase";
import { User } from "../types";
import logger from "../utils/logger";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user document in Firestore
    const userData: Omit<User, "id"> = {
      email,
      name,
      createdAt: new Date()
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      token,
      user: {
        id: userRecord.uid,
        ...userData
      }
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(400).json({ error: "Failed to register user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verify credentials with Firebase Auth
    const userCredential = await auth.getUserByEmail(email);

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userCredential.uid).get();
    const userData = userDoc.data() as Omit<User, "id">;

    // Create custom token
    const token = await auth.createCustomToken(userCredential.uid);

    res.json({
      token,
      user: {
        id: userCredential.uid,
        ...userData
      }
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.uid;
    const { name, email } = req.body;

    // Update Auth profile
    await auth.updateUser(userId, {
      email,
      displayName: name
    });

    // Update Firestore document
    await db.collection("users").doc(userId).update({
      name,
      email
    });

    const updatedDoc = await db.collection("users").doc(userId).get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateFcmToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user.uid;
    const { fcmToken } = req.body;

    await db.collection("users").doc(userId).update({
      fcmToken
    });

    res.json({ message: "FCM token updated successfully" });
  } catch (error) {
    logger.error("Update FCM token error:", error);
    res.status(500).json({ error: "Failed to update FCM token" });
  }
};
