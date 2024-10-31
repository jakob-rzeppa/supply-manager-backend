import { Response } from "express";
import Joi from "joi";
import validateLocals from "../../validation/localsValidation";
import LocalsValidationError from "../../errors/validation/localsValidationError";

describe("validateLocals", () => {
  let res: Partial<Response>;

  beforeEach(() => {
    res = {
      locals: {},
    };
  });

  it("should return undefined if res.locals matches the schema", () => {
    res.locals = { key: "value" };
    const schema = Joi.object({
      key: Joi.string().required(),
    });

    const result = validateLocals(res as Response, schema);

    expect(result).toBeUndefined();
  });

  it("should return a ValidationError if res.locals does not match the schema", () => {
    res.locals = { key: 123 };
    const schema = Joi.object({
      key: Joi.string().required(),
    });

    const result = validateLocals(res as Response, schema);

    expect(result).toBeInstanceOf(LocalsValidationError);
    expect(result!.message).toBe(
      'res.locals not as expected: "key" must be a string'
    );
    expect(result!.getResponseStatus()).toBe(500);
  });

  it("should return a ValidationError if res.locals is missing required fields", () => {
    res.locals = {};
    const schema = Joi.object({
      key: Joi.string().required(),
    });

    const result = validateLocals(res as Response, schema);

    expect(result).toBeInstanceOf(LocalsValidationError);
    expect(result!.message).toBe(
      'res.locals not as expected: "key" is required'
    );
    expect(result!.getResponseStatus()).toBe(500);
  });
});
