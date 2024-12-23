import { NextFunction, Request, Response } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import AuthenticationError from "../../errors/auth/authenticationError";
import AuthorisationError from "../../errors/auth/authorisationError";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

describe("authMiddleware", () => {
  it("should call next with an error if no token is provided", () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AuthenticationError("No token provided")
    );
  });

  it("should call next with an error if the token is invalid", () => {
    const req = {
      headers: { authorization: "bearer invalidAuthToken" },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AuthorisationError("Invalid or expired token")
    );
  });

  it("should set res.locals.user with the user details if the token is valid", () => {
    const user = { name: "name", id: "id", email: "email" };
    const token = jwt.sign(user, env.ACCESS_TOKEN_SECRET);
    const req = {
      headers: { authorization: `bearer ${token}` },
    } as unknown as Request;
    const res = { locals: {} } as Response;
    const next = jest.fn() as NextFunction;
    authMiddleware(req, res, next);
    expect(res.locals.user).toEqual(user);
    expect(next).toHaveBeenCalled();
  });
});
