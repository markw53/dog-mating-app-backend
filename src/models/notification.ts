import { firestore } from "firebase-admin";

export interface Notification {
  id: string;
  userId: string;
  type: "match_request" | "match_update" | "message" | "system";
  title: string;
  body: string;
  data?: {
    matchId?: string;
    dogId?: string;
    messageId?: string;
  };
  createdAt: firestore.Timestamp | Date;
  readAt?: firestore.Timestamp | Date;
  sentAt?: firestore.Timestamp | Date;
}

export interface NotificationCreateDTO {
  userId: string;
  type: "match_request" | "match_update" | "message" | "system";
  title: string;
  body: string;
  data?: {
    matchId?: string;
    dogId?: string;
    messageId?: string;
  };
}
