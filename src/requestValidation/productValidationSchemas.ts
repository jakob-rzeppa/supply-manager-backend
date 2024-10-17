import Joi from "joi";

export const createProductBodySchema = Joi.object({
  ean: Joi.string().length(13).required(),
  name: Joi.string().required(),
  description: Joi.string().allow("").required(),
});

export const updateProductBodySchema = Joi.object({
  ean: Joi.string().length(13).optional(),
  name: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
});

export const idSchema = Joi.string().length(24).required();
