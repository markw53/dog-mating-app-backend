export const constants = {
  // App Configuration
  APP: {
    NAME: "Dog Mating App",
    VERSION: "1.0.0",
    ENVIRONMENT: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 5000,
    API_PREFIX: "/api",
    CORS_ORIGIN: process.env.FRONTEND_URL || "http://localhost:3000"
  },

  // Authentication
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
    TOKEN_EXPIRY: "7d",
    SALT_ROUNDS: 10,
    MIN_PASSWORD_LENGTH: 6,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME: 15 * 60 * 1000 // 15 minutes in milliseconds
  },

  // Firebase Configuration
  FIREBASE: {
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    DATABASE_URL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  },

  // Collection Names
  COLLECTIONS: {
    USERS: "users",
    DOGS: "dogs",
    MATCHES: "matches",
    MESSAGES: "messages",
    NOTIFICATIONS: "notifications"
  },

  // Storage
  STORAGE: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
    ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "image/jpg"],
    IMAGE_RESIZE: {
      THUMBNAIL: { width: 150, height: 150 },
      PREVIEW: { width: 300, height: 300 },
      FULL: { width: 1024, height: 1024 }
    }
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
    DEFAULT_ORDER: "desc"
  },

  // Geolocation
  GEO: {
    DEFAULT_RADIUS: 10, // kilometers
    MAX_RADIUS: 100, // kilometers
    EARTH_RADIUS: 6371 // Earth's radius in kilometers
  },

  // Dog Related
  DOG: {
    MIN_AGE: 0,
    MAX_AGE: 30,
    GENDERS: ["male", "female"] as const,
    SIZES: ["small", "medium", "large"] as const,
    ENERGY_LEVELS: ["low", "medium", "high"] as const,
    FRIENDLINESS_LEVELS: ["low", "medium", "high"] as const,
    MAX_PHOTOS: 6,
    MIN_DESCRIPTION_LENGTH: 10,
    MAX_DESCRIPTION_LENGTH: 500
  },

  // Match Related
  MATCH: {
    STATUSES: ["pending", "accepted", "rejected"] as const,
    PURPOSES: ["breeding", "playdate"] as const,
    MAX_ACTIVE_MATCHES: 10,
    EXPIRY_DAYS: 7
  },

  // Message Related
  MESSAGE: {
    MAX_LENGTH: 1000,
    MAX_ATTACHMENTS: 5,
    ALLOWED_ATTACHMENT_TYPES: ["image", "document"] as const
  },

  // Notification Related
  NOTIFICATION: {
    TYPES: ["match_request", "match_update", "message", "system"] as const,
    MAX_RETRIES: 3,
    RETRY_DELAY: 5000 // 5 seconds in milliseconds
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
    MAX_REQUESTS: 100,
    MESSAGE_WINDOW_MS: 60 * 1000, // 1 minute in milliseconds
    MAX_MESSAGES: 30
  },

  // Cache
  CACHE: {
    TTL: 60 * 60, // 1 hour in seconds
    MAX_ITEMS: 1000
  },

  // Validation
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^\+?[\d\s-]+$/,
    URL_PATTERN: /^https?:\/\/.+/
  },

  // Error Messages
  ERRORS: {
    AUTH: {
      INVALID_CREDENTIALS: "Invalid email or password",
      UNAUTHORIZED: "Unauthorized access",
      TOKEN_EXPIRED: "Token has expired",
      INVALID_TOKEN: "Invalid token",
      EMAIL_IN_USE: "Email is already in use"
    },
    DOG: {
      NOT_FOUND: "Dog not found",
      UNAUTHORIZED: "Not authorized to perform this action",
      INVALID_DATA: "Invalid dog data provided",
      MAX_PHOTOS_EXCEEDED: "Maximum number of photos exceeded"
    },
    MATCH: {
      NOT_FOUND: "Match not found",
      ALREADY_EXISTS: "Match already exists between these dogs",
      INVALID_STATUS: "Invalid match status",
      MAX_MATCHES_EXCEEDED: "Maximum number of active matches exceeded"
    },
    MESSAGE: {
      NOT_FOUND: "Message not found",
      INVALID_CONTENT: "Invalid message content",
      RATE_LIMIT_EXCEEDED: "Message rate limit exceeded"
    },
    FILE: {
      SIZE_EXCEEDED: "File size exceeded",
      INVALID_TYPE: "Invalid file type",
      UPLOAD_FAILED: "File upload failed"
    }
  },

  // Success Messages
  SUCCESS: {
    AUTH: {
      REGISTERED: "User registered successfully",
      LOGGED_IN: "Logged in successfully",
      PROFILE_UPDATED: "Profile updated successfully"
    },
    DOG: {
      CREATED: "Dog profile created successfully",
      UPDATED: "Dog profile updated successfully",
      DELETED: "Dog profile deleted successfully"
    },
    MATCH: {
      CREATED: "Match created successfully",
      UPDATED: "Match updated successfully",
      DELETED: "Match deleted successfully"
    },
    MESSAGE: {
      SENT: "Message sent successfully",
      DELETED: "Message deleted successfully"
    }
  },

  // Socket Events
  SOCKET: {
    EVENTS: {
      CONNECT: "connect",
      DISCONNECT: "disconnect",
      JOIN_MATCH: "joinMatch",
      LEAVE_MATCH: "leaveMatch",
      NEW_MESSAGE: "newMessage",
      MESSAGE_READ: "messageRead",
      TYPING_START: "typingStart",
      TYPING_END: "typingEnd",
      MATCH_UPDATE: "matchUpdate"
    }
  }
};

export default constants;
