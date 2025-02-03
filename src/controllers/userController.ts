import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { User } from "../models/user";
import logger from "../utils/logger";
import { validateInput, userSchema } from "../utils/validators";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(users);
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const userDoc = await db.collection("users").doc(req.params.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: userDoc.id,
      ...userDoc.data()
    });
  } catch (error) {
    logger.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Verify user can only update their own profile
    if (userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    validateInput(userSchema, req.body);

    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection("users").doc(userId).update(updates);

    // Update Auth profile if email or name changed
    if (updates.email || updates.name) {
      await auth.updateUser(userId, {
        email: updates.email,
        displayName: updates.name
      });
    }

    const updatedDoc = await db.collection("users").doc(userId).get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    logger.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // Verify user can only delete their own account
    if (userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete from Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await db.collection("users").doc(userId).delete();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { notifications, emailUpdates, radius } = req.body;

    await db.collection("users").doc(userId).update({
      "preferences.notifications": notifications,
      "preferences.emailUpdates": emailUpdates,
      "preferences.radius": radius,
      updatedAt: new Date()
    });

    res.json({ message: "Preferences updated successfully" });
  } catch (error) {
    logger.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

export const updateFcmToken = async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
    }

    await db.collection("users").doc(req.user.uid).update({
      fcmToken,
      updatedAt: new Date()
    });

    res.json({ message: "FCM token updated successfully" });
  } catch (error) {
    logger.error("Update FCM token error:", error);
    res.status(500).json({ error: "Failed to update FCM token" });
  }
};
