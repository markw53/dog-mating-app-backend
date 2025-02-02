import Joi from "joi";

export const dogSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  breed: Joi.string().required(),
  age: Joi.number().required().min(0).max(30),
  gender: Joi.string().valid("male", "female").required(),
  description: Joi.string().max(500),
  location: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180)
  }).required()
});

export const messageSchema = Joi.object({
  content: Joi.string().required().max(1000)
});

export const validateInput = (schema: Joi.ObjectSchema, data: any) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
};
