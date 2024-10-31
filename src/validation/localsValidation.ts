import { Response } from "express";
import Joi from "joi";
import ValidationError from "../errors/validation/validationError";
import LocalsValidationError from "../errors/validation/localsValidationError";

export default function validateLocals(
  res: Response,
  expected: Joi.ObjectSchema
) {
  const { error } = expected.validate(res.locals);
  if (error) {
    return new LocalsValidationError(
      "res.locals not as expected: " + error.message
    );
  }
  return undefined;
}
