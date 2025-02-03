import Joi from "joi";

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s-]+$/),
  preferences: Joi.object({
    notifications: Joi.boolean(),
    emailUpdates: Joi.boolean(),
    radius: Joi.number().min(1).max(100)
  })
});

export const dogSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  breed: Joi.string().required(),
  age: Joi.number().required().min(0).max(30),
  gender: Joi.string().valid("male", "female").required(),
  photos: Joi.array().items(Joi.string().uri()),
  description: Joi.string().max(500),
  location: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    address: Joi.string()
  }).required(),
  traits: Joi.object({
    size: Joi.string().valid("small", "medium", "large"),
    energy: Joi.string().valid("low", "medium", "high"),
    friendliness: Joi.string().valid("low", "medium", "high")
  }),
  medicalInfo: Joi.object({
    vaccinated: Joi.boolean(),
    neutered: Joi.boolean(),
    lastCheckup: Joi.date()
  }),
  pedigree: Joi.object({
    hasDocuments: Joi.boolean(),
    registrationNumber: Joi.string()
  })
});

export const matchSchema = Joi.object({
  dog1Id: Joi.string().required(),
  dog2Id: Joi.string().required(),
  matchPreferences: Joi.object({
    purpose: Joi.string().valid("breeding", "playdate").required(),
    preferredDate: Joi.date(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      address: Joi.string()
    })
  }),
  notes: Joi.string().max(500)
});

export const messageSchema = Joi.object({
  matchId: Joi.string().required(),
  content: Joi.string().required().max(1000),
  attachments: Joi.array().items(
    Joi.object({
      type: Joi.string().valid("image", "document").required(),
      url: Joi.string().uri().required(),
      name: Joi.string().required()
    })
  )
});
