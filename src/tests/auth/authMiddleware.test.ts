import { NextFunction, Request, Response } from "express";
import authMiddleware from "../../auth/authMiddleware";
import jwt from "jsonwebtoken";
import AuthenticationError from "../../errors/auth/authenticationError";

describe("authMiddleware", () => {
  it("should call next with an error if no token is provided", () => {
    const req = { headers: {} } as any as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AuthenticationError("No token provided")
    );
  });
});
