import { Request } from "express";
import ValidationError from "../errors/validation/validationError";
import Joi from "joi";

export default function validateRequest(
  req: Request,
  options: {
    headers?: string[];
    queryParams?: string[];
    body?: Joi.ObjectSchema;
  }
): ValidationError | undefined {
  const errorMessages: string[] = [];

  if (options.queryParams) {
    const query = req.query;
    for (const key of options.queryParams) {
      if (!query[key]) {
        errorMessages.push(`Query parameter ${key} is required`);
      }
    }
  }

  if (options.headers) {
    const headers = req.headers;
    for (const key of options.headers) {
      if (!headers[key]) {
        errorMessages.push(`Header ${key} is required`);
      }
    }
  }

  if (options.body) {
    const body = req.body;
    const { error } = options.body.validate(body);
    if (error) {
      errorMessages.push(
        "Request Body not as expected (" + error.message + ")"
      );
    }
  }

  if (errorMessages.length > 0) {
    return new ValidationError(
      "Request validation failed: " + errorMessages.join(", ")
    );
  }
  return undefined;
}
