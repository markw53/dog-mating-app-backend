import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Message, Match } from "../types";
import logger from "../utils/logger";
import { socketIO } from "../config/socket";
import { sendPushNotification } from "../services/notificationService";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { matchId, content } = req.body;

    // Verify match exists and user is part of it
    const matchDoc = await db.collection("matches").doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const matchData = matchDoc.data() as Match;

    // Get both dogs to verify ownership
    const [dog1Doc, dog2Doc] = await Promise.all([
      db.collection("dogs").doc(matchData.dog1Id).get(),
      db.collection("dogs").doc(matchData.dog2Id).get()
    ]);

    if (
      dog1Doc.data()?.ownerId !== req.user.uid &&
      dog2Doc.data()?.ownerId !== req.user.uid
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to send messages in this match" });
    }

    const messageData: Omit<Message, "id"> = {
      matchId,
      senderId: req.user.uid,
      content,
      createdAt: new Date()
    };

    const messageRef = await db.collection("messages").add(messageData);
    const message = { id: messageRef.id, ...messageData };

    // Emit message through Socket.IO
    socketIO.to(matchId).emit("newMessage", message);

    // Send push notification to the other user
    const otherDogOwner =
      dog1Doc.data()?.ownerId === req.user.uid
        ? dog2Doc.data()?.ownerId
        : dog1Doc.data()?.ownerId;

    if (otherDogOwner) {
      const senderDog =
        dog1Doc.data()?.ownerId === req.user.uid
          ? dog1Doc.data()?.name
          : dog2Doc.data()?.name;

      await sendPushNotification(
        otherDogOwner,
        "New Message!",
        `${senderDog}'s owner sent you a message`
      );
    }

    res.status(201).json(message);
  } catch (error) {
    logger.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;

    // Verify match exists and user is part of it
    const matchDoc = await db.collection("matches").doc(matchId).get();
    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const matchData = matchDoc.data() as Match;

    // Get both dogs to verify ownership
    const [dog1Doc, dog2Doc] = await Promise.all([
      db.collection("dogs").doc(matchData.dog1Id).get(),
      db.collection("dogs").doc(matchData.dog2Id).get()
    ]);

    if (
      dog1Doc.data()?.ownerId !== req.user.uid &&
      dog2Doc.data()?.ownerId !== req.user.uid
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to view messages in this match" });
    }

    const messagesSnapshot = await db
      .collection("messages")
      .where("matchId", "==", matchId)
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(messages);
  } catch (error) {
    logger.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};
