import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AuthenticationError from "../errors/auth/authenticationError";
import AuthorisationError from "../errors/auth/authorisationError";
import validateRequest from "../validation/requestValidation";
import Joi from "joi";
import { env } from "../config/env";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import authDatabase from "../database/auth/authDatabase";
import mongoose from "mongoose";

const authRoutes = Router();

function generateAccessToken(user: { name: string; id: string }) {
  return jwt.sign(user, env.ACCESS_TOKEN_SECRET!, { expiresIn: "30m" });
}

authRoutes.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    validateRequest(req, {
      body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }),
    });

    // TODO Authenticate user

    const username: string = req.body.username;
    const user = {
      name: username,
      id: "ffffffffffffffffffffffff",
      email: "test@test.de",
    };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, env.REFRESH_TOKEN_SECRET as string);

    const [error] = await catchPromiseError(
      authDatabase.createRefreshToken({
        refresh_token: refreshToken,
        user_id: new mongoose.Types.ObjectId(user.id),
      })
    );
    if (error) return next(error);

    res.status(200).json({ accessToken, refreshToken });
  }
);

authRoutes.post(
  "/token",
  async (req: Request, res: Response, next: NextFunction) => {
    validateRequest(req, {
      body: Joi.object({
        token: Joi.string().required(),
      }),
    });

    const refreshToken: string = req.body.token;

    if (!refreshToken)
      return next(new AuthenticationError("No token provided"));

    const [error, refreshTokens] = await catchPromiseError(
      authDatabase.getRefreshTokens()
    );
    if (error) return next(error);

    if (!refreshTokens.some((token) => token.refresh_token === refreshToken))
      return next(new AuthorisationError("Invalid token"));

    jwt.verify(
      refreshToken,
      env.REFRESH_TOKEN_SECRET as string,
      (err, user) => {
        if (err)
          return next(new AuthorisationError("Invalid or expired token"));

        if (typeof user !== "string" && user) {
          const accessToken = generateAccessToken({
            name: user.name,
            id: user.id,
          });
          res.status(200).json({ accessToken });
        } else {
          return next(new AuthenticationError("Invalid token payload"));
        }
      }
    );
  }
);

authRoutes.delete(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    validateRequest(req, {
      body: Joi.object({
        token: Joi.string().required(),
      }),
    });

    const token = req.body.token;

    const [error] = await catchPromiseError(
      authDatabase.deleteRefreshToken(token)
    );
    if (error) return next(error);

    res.sendStatus(204);
  }
);

authRoutes.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    validateRequest(req, {
      body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    });

    const username: string = req.body.username;
    const password: string = req.body.password;
    const email: string = req.body.email;

    const user = {
      name: username,
      id: "ffffffffffffffffffffffff",
      email,
    };

    // TODO Create user in db

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, env.REFRESH_TOKEN_SECRET as string);

    const [error] = await catchPromiseError(
      authDatabase.createRefreshToken({
        refresh_token: refreshToken,
        user_id: new mongoose.Types.ObjectId(user.id),
      })
    );
    if (error) return next(error);

    res.status(200).json({ accessToken, refreshToken });
  }
);

authRoutes.put("/update", async (req: Request, res: Response) => {
  // TODO Update user in db
  res.sendStatus(204);
});

authRoutes.delete("/delete", async (req: Request, res: Response) => {
  // TODO Delete user from db
  // TODO Delete all products for user from db
  // TODO Delete all refresh tokens for user from db
  res.sendStatus(204);
});

export default authRoutes;
