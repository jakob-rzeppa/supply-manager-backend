import { Request, Response } from "express";
import ValidationError from "../errors/validation/validationError";
import Joi from "joi";
import { ParsedQs } from "qs";

export function validateParams(
  reqParams: {
    [key: string]: string;
  },
  expectedParams?: Map<string, Joi.StringSchema>
) {
  if (!expectedParams) {
    return [];
  }

  const errorMessages: string[] = [];
  for (const [key, schema] of expectedParams.entries()) {
    const { error } = schema.validate(reqParams[key]);
    if (error) {
      errorMessages.push(`Param ${key} not as expected (${error.message})`);
    }
  }
  return errorMessages;
}

export function validateQuerys(
  reqQuery: {
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
  },
  expectedQuery?: Map<string, Joi.StringSchema>
) {
  if (!expectedQuery) {
    return [];
  }

  const errorMessages: string[] = [];
  for (const [key, schema] of expectedQuery.entries()) {
    const { error } = schema.validate(reqQuery[key]);
    if (error) {
      errorMessages.push(`Query ${key} not as expected (${error.message})`);
    }
  }
  return errorMessages;
}

export function validateHeaders(
  reqHeaders: {
    [key: string]: string | string[] | undefined;
  },
  expectedHeaders?: Map<string, Joi.StringSchema>
) {
  if (!expectedHeaders) {
    return [];
  }

  const errorMessages: string[] = [];
  for (const [key, schema] of expectedHeaders.entries()) {
    const { error } = schema.validate(reqHeaders[key]);
    if (error) {
      errorMessages.push(`Header ${key} not as expected (${error.message})`);
    }
  }
  return errorMessages;
}

export function validateBody(reqBody: Object, expectedBody?: Joi.ObjectSchema) {
  if (!expectedBody) {
    return [];
  }

  const { error } = expectedBody.validate(reqBody);
  if (error) {
    return ["Request Body not as expected (" + error.message + ")"];
  }
  return [];
}

export default function validateRequest(
  req: Request,
  expected: {
    headers?: Map<string, Joi.StringSchema>;
    params?: Map<string, Joi.StringSchema>;
    query?: Map<string, Joi.StringSchema>;
    body?: Joi.ObjectSchema;
  }
): ValidationError | undefined {
  const errorMessages = [
    ...validateParams(req.params, expected.params),
    ...validateQuerys(req.query, expected.query),
    ...validateHeaders(req.headers, expected.headers),
    ...validateBody(req.body, expected.body),
  ];

  if (errorMessages.length > 0) {
    return new ValidationError(
      "Request validation failed: " + errorMessages.join(", ")
    );
  }
  return undefined;
}
