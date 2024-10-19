import { NextFunction, Request, Response } from "express";
import AuthenticationError from "../errors/auth/authenticationError";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AuthorisationError from "../errors/auth/authorisationError";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  throw new Error("No ACCESS_TOKEN_SECRET provided");
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === undefined)
    return next(new AuthenticationError("No token provided"));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
    if (err) return next(new AuthorisationError("Invalid or expired token"));
    user = user as { name: string; id: string; email: string };
    res.locals.user = { name: user.name, id: user.id, email: user.email };
    return next();
  });
}
