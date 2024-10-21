import { NextFunction, Request, Response } from "express";
import authMiddleware from "../../auth/authMiddleware";
import AuthenticationError from "../../errors/auth/authenticationError";
import AuthorisationError from "../../errors/auth/authorisationError";
import jwt from "jsonwebtoken";

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

  it("should call next with an error if the token is invalid", () => {
    const req = {
      headers: { authorization: "bearer invalidAuthToken" },
    } as any as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AuthorisationError("Invalid or expired token")
    );
  });

  it("should set res.locals.user with the user details if the token is valid", () => {
    const secret = "secret";
    const mockUser = { name: "name", id: "id", email: "email" };

    jwt.sign(mockUser, secret, (err, token) => {
      const req = {
        headers: { authorization: `bearer ${token}` },
      } as any as Request;
      const res = { locals: {} } as Response;
      const next = jest.fn() as NextFunction;
      authMiddleware(req, res, next);
      expect(res.locals.user).toEqual({
        name: mockUser.name,
        id: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
