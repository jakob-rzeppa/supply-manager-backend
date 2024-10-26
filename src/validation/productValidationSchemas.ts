import Joi from "joi";

export const idSchema = Joi.string().length(24).required();
export const eanSchema = Joi.string().length(13).required();

export const createProductBodySchema = Joi.object({
  ean: eanSchema,
  name: Joi.string().required(),
  description: Joi.string().allow("").required(),
});

export const updateProductBodySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow("").optional(),
});

export const createItemBodySchema = Joi.object({
  expiration_date: Joi.date().required(),
});
