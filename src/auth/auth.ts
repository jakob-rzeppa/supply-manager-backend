/*import "jsr:@std/dotenv/load";
import jwt from "npm:jsonwebtoken";
import { VerifyErrors } from "npm:@types/jsonwebtoken";
import { Router, Request, Response, Next } from "express";
import type Database from "../database/database.ts";
import AuthenticationError from "../errors/authenticationError.ts";

const TOKEN_SECRET = Deno.env.get("TOKEN_SECRET");
if (!TOKEN_SECRET) throw new Error("TOKEN_SECRET must be provided");

function generateAccessToken(username: string): string {
  return jwt.sign(username, TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}

function authenticateToken(req: Request, res: Response, next: Next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) throw new AuthenticationError("Token not provided");

  jwt.verify(token, TOKEN_SECRET, (err: VerifyErrors | null, user: unknown) => {
    if (err) throw new AuthenticationError("Token not valid");

    req.user = user;

    next();
  });
}

function getAuthRoutes(db: Database): Router {
  const authRoutes = new Router();

  authRoutes.post("/api/register", async (req: Request, res: Response) => {
    const body = await req.json();
    const username: string = body.username;
    const password: string = body.password;

    const token = generateAccessToken(username);

    return authRoutes;
  });
}
*/