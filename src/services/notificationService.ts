import { messaging } from "firebase-admin";
import { db } from "../config/firebase";

export const sendPushNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: { [key: string]: string }
) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) return;

    const message: messaging.Message = {
      notification: {
        title,
        body
      },
      data,
      token: fcmToken
    };

    await messaging().send(message);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
