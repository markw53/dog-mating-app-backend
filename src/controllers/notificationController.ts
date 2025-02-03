import { Request, Response } from "express";
import { db } from "../config/firebase";
import logger from "../utils/logger";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { unread } = req.query;
    let query = db
      .collection("notifications")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc");

    if (unread === "true") {
      query = query.where("readAt", "==", null);
    }

    const notificationsSnapshot = await query.get();

    const notifications = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(notifications);
  } catch (error) {
    logger.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to get notifications" });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", req.user.uid)
      .where("readAt", "==", null)
      .count()
      .get();

    res.json({ count: snapshot.data().count });
  } catch (error) {
    logger.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const notificationRef = db.collection("notifications").doc(req.params.id);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (doc.data()?.userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await notificationRef.update({
      readAt: new Date()
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    logger.error("Mark notification as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notificationRef = db.collection("notifications").doc(req.params.id);
    const doc = await notificationRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (doc.data()?.userId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await notificationRef.delete();

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    logger.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
