import { NextFunction, Request, Response } from "express";
import AuthenticationError from "../errors/auth/authenticationError";
import jwt from "jsonwebtoken";
import AuthorisationError from "../errors/auth/authorisationError";
import { env } from "../config/env";

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === undefined)
    return next(new AuthenticationError("No token provided"));

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return next(new AuthorisationError("Invalid or expired token"));
    user = user as { name: string; id: string; email: string };
    res.locals.user = { name: user.name, id: user.id, email: user.email };
    return next();
  });
}
