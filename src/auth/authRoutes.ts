import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AuthenticationError from "../errors/auth/authenticationError";
import AuthorisationError from "../errors/auth/authorisationError";
import validateRequest from "../validation/requestValidation";
import Joi from "joi";
import { env } from "../config/env";

const authRoutes = Router();

// TODO move to database
let refreshTokens: string[] = [];

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
    refreshTokens.push(refreshToken);

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
    if (!refreshTokens.includes(refreshToken))
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

authRoutes.delete("/logout", (req: Request, res: Response) => {
  validateRequest(req, {
    body: Joi.object({
      token: Joi.string().required(),
    }),
  });

  const token = req.body.token;

  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.sendStatus(204);
});

export default authRoutes;
