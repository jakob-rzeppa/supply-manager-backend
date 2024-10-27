import { Response } from "express";
import Joi from "joi";
import ValidationError from "../errors/validation/validationError";

export default function validateLocals(
  res: Response,
  expected: Joi.ObjectSchema
) {
  const { error } = expected.validate(res.locals);
  if (error) {
    return new ValidationError(
      "res.locals not as expected: " + error.message,
      500
    );
  }
  return undefined;
}
