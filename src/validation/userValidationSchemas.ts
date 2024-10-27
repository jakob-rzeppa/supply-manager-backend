import Joi from "joi";

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  id: Joi.string().length(24).required(),
});
