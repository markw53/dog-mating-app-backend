import { db } from "../config/firebase";
import { Message } from "../types";
import { socketIO } from "../config/socket";

export const createMessage = async (
  matchId: string,
  senderId: string,
  content: string
): Promise<Message> => {
  const messageData: Omit<Message, "id"> = {
    matchId,
    senderId,
    content,
    createdAt: new Date()
  };

  const messageRef = await db.collection("messages").add(messageData);
  const message = { id: messageRef.id, ...messageData };

  // Emit message to connected clients
  socketIO.to(matchId).emit("newMessage", message);

  return message;
};

export const getMessagesByMatch = async (
  matchId: string
): Promise<Message[]> => {
  const messagesSnapshot = await db
    .collection("messages")
    .where("matchId", "==", matchId)
    .orderBy("createdAt", "asc")
    .get();

  return messagesSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data()
      } as Message)
  );
};
