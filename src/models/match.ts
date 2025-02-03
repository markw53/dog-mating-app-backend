import { firestore } from "firebase-admin";

export interface Match {
  id: string;
  dog1Id: string;
  dog2Id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: firestore.Timestamp | Date;
  updatedAt?: firestore.Timestamp | Date;
  lastMessageAt?: firestore.Timestamp | Date;
  matchPreferences?: {
    purpose: "breeding" | "playdate";
    preferredDate?: Date;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  notes?: string;
}

export interface MatchCreateDTO {
  dog1Id: string;
  dog2Id: string;
  matchPreferences?: {
    purpose: "breeding" | "playdate";
    preferredDate?: Date;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  notes?: string;
}

export interface MatchUpdateDTO {
  status: "accepted" | "rejected";
  matchPreferences?: {
    purpose?: "breeding" | "playdate";
    preferredDate?: Date;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  };
  notes?: string;
}
