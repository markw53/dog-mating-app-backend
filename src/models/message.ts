import { firestore } from "firebase-admin";

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: firestore.Timestamp | Date;
  readAt?: firestore.Timestamp | Date;
  attachments?: {
    type: "image" | "document";
    url: string;
    name: string;
  }[];
  metadata?: {
    isSystemMessage: boolean;
    type?: "match_accepted" | "match_rejected" | "appointment_set";
  };
}

export interface MessageCreateDTO {
  matchId: string;
  content: string;
  attachments?: {
    type: "image" | "document";
    url: string;
    name: string;
  }[];
}
