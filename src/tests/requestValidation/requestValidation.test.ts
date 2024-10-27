import {
  validateParams,
  validateQuerys,
  validateHeaders,
  validateBody,
  default as validateRequest,
} from "../../validation/requestValidation";
import Joi from "joi";
import { Request } from "express";
import ValidationError from "../../errors/validation/validationError";

describe("Request Validation", () => {
  describe("validateParams", () => {
    it("should return an empty array if no expectedParams are provided", () => {
      const result = validateParams({ param1: "value1" }, undefined);
      expect(result).toEqual([]);
    });

    it("should return error messages for invalid params", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("param1", Joi.string().required());

      const result = validateParams({ param1: 123 as any }, schema);
      expect(result).toEqual([
        'Param param1 not as expected ("value" must be a string)',
      ]);
    });

    it("should return error messages for missing params", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("param1", Joi.string().required());

      const result = validateParams({}, schema);
      expect(result).toEqual([
        'Param param1 not as expected ("value" is required)',
      ]);
    });

    it("should return an empty array if correct params supplied", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("param1", Joi.string().required());

      const result = validateParams({ param1: "value1" }, schema);
      expect(result).toEqual([]);
    });
  });

  describe("validateQuerys", () => {
    it("should return an empty array if no expectedQuery are provided", () => {
      const result = validateQuerys({ query1: "value1" });
      expect(result).toEqual([]);
    });

    it("should return error messages for invalid queries", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("query1", Joi.string().required());

      const result = validateQuerys({ query1: 123 as any }, schema);
      expect(result).toEqual([
        'Query query1 not as expected ("value" must be a string)',
      ]);
    });

    it("should return error messages for missing queries", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("query1", Joi.string().required());

      const result = validateQuerys({}, schema);
      expect(result).toEqual([
        'Query query1 not as expected ("value" is required)',
      ]);
    });

    it("should return an empty array if correct queries supplied", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("query1", Joi.string().required());

      const result = validateQuerys({ query1: "value1" }, schema);
      expect(result).toEqual([]);
    });
  });

  describe("validateHeaders", () => {
    it("should return an empty array if no expectedHeaders are provided", () => {
      const result = validateHeaders({ header1: "value1" });
      expect(result).toEqual([]);
    });

    it("should return error messages for invalid headers", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("header1", Joi.string().required());

      const result = validateHeaders({ header1: 123 as any }, schema);
      expect(result).toEqual([
        'Header header1 not as expected ("value" must be a string)',
      ]);
    });

    it("should return error messages for missing headers", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("header1", Joi.string().required());

      const result = validateHeaders({}, schema);
      expect(result).toEqual([
        'Header header1 not as expected ("value" is required)',
      ]);
    });

    it("should return an empty array if correct headers supplied", () => {
      const schema = new Map<string, Joi.StringSchema>();
      schema.set("header1", Joi.string().required());

      const result = validateHeaders({ header1: "value1" }, schema);
      expect(result).toEqual([]);
    });
  });

  describe("validateBody", () => {
    it("should return an array if no expectedBody is provided", () => {
      const result = validateBody({ key: "value" });
      expect(result).toEqual([]);
    });

    it("should return error message for invalid body", () => {
      const schema = Joi.object({
        key: Joi.string().required(),
      });

      const result = validateBody({ key: 123 }, schema);
      expect(result).toEqual([
        'Request Body not as expected ("key" must be a string)',
      ]);
    });

    it("should return error message for missing body", () => {
      const schema = Joi.object({
        key: Joi.string().required(),
      });

      const result = validateBody({}, schema);
      expect(result).toEqual([
        'Request Body not as expected ("key" is required)',
      ]);
    });

    it("should return an empty array if correct body supplied", () => {
      const schema = Joi.object({
        key: Joi.string().required(),
      });

      const result = validateBody({ key: "value" }, schema);
      expect(result).toEqual([]);
    });
  });

  describe("validateRequest", () => {
    it("should return undefined if all validations pass", () => {
      const req = {
        params: { param1: "value1" },
        query: { query1: "value1" },
        headers: { header1: "value1" },
        body: { key: "value" },
      } as unknown as Request;

      const expected = {
        params: new Map([["param1", Joi.string().required()]]),
        query: new Map([["query1", Joi.string().required()]]),
        headers: new Map([["header1", Joi.string().required()]]),
        body: Joi.object({ key: Joi.string().required() }),
      };

      const result = validateRequest(req, expected);
      expect(result).toBeUndefined();
    });

    it("should return ValidationError if any validation fails", () => {
      const req = {
        params: { param1: 123 },
        query: { query1: 123 },
        headers: { header1: 123 },
        body: { key: 123 },
      } as unknown as Request;

      const expected = {
        params: new Map([["param1", Joi.string().required()]]),
        query: new Map([["query1", Joi.string().required()]]),
        headers: new Map([["header1", Joi.string().required()]]),
        body: Joi.object({ key: Joi.string().required() }),
      };

      const result = validateRequest(req, expected);
      expect(result).toBeInstanceOf(ValidationError);
      expect(result?.message).toContain("Request validation failed:");
    });
  });
});
