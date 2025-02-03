import { firestore } from "firebase-admin";

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  photos: string[];
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: firestore.Timestamp | Date;
  updatedAt?: firestore.Timestamp | Date;
  traits?: {
    size: "small" | "medium" | "large";
    energy: "low" | "medium" | "high";
    friendliness: "low" | "medium" | "high";
  };
  medicalInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    lastCheckup?: Date;
  };
  pedigree?: {
    hasDocuments: boolean;
    registrationNumber?: string;
  };
  availability?: {
    isAvailable: boolean;
    nextAvailableDate?: Date;
  };
}

export interface DogCreateDTO {
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  photos?: string[];
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  traits?: {
    size: "small" | "medium" | "large";
    energy: "low" | "medium" | "high";
    friendliness: "low" | "medium" | "high";
  };
  medicalInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    lastCheckup?: Date;
  };
  pedigree?: {
    hasDocuments: boolean;
    registrationNumber?: string;
  };
}

export interface DogUpdateDTO extends Partial<DogCreateDTO> {}
