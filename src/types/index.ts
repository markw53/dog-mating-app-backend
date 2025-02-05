export interface TokenExchangeRequest {
  customToken: string;
}

export interface TokenResponse {
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  photos: string[];
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
}

export interface Match {
  id: string;
  dog1Id: string;
  dog2Id: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}
