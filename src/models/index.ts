export * from "./user";
export * from "./dog";
export * from "./match";
export * from "./message";
export * from "./notification";

// Common types used across models
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}
