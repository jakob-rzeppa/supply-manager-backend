import { Router, Request, Response, NextFunction } from "express";
import "dotenv/config";
import validateRequest from "../validation/requestValidation";
import Joi from "joi";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import authDatabase from "../database/auth/authDatabase";
import { generateAccessToken } from "./authTokens";
import AuthorisationError from "../errors/auth/authorisationError";
import bcrypt from "bcrypt";
import usersRoutes from "./usersRoutes";

const authRoutes = Router();

authRoutes.use("/users", usersRoutes);

authRoutes.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    validateRequest(req, {
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),
    });

    const email: string = req.body.email;
    const password: string = req.body.password;

    const [userError, user] = await catchPromiseError(
      authDatabase.getUserByEmail(email)
    );
    if (userError) return next(userError);

    if (!(await bcrypt.compare(password, user.password)))
      return next(new AuthorisationError("Invalid password"));

    const [tokenCreationError, accessToken] = await catchPromiseError(
      generateAccessToken({
        email: user.email,
        name: user.name,
        id: user._id.toString(),
      })
    );
    if (tokenCreationError) return next(tokenCreationError);

    const [error] = await catchPromiseError(
      authDatabase.createAccessToken({
        token: accessToken,
        user_id: user._id,
      })
    );
    if (error) return next(error);

    res.status(200).json({ accessToken });
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
      authDatabase.deleteAccessToken(token)
    );
    if (error) return next(error);

    res.sendStatus(204);
  }
);

export default authRoutes;
