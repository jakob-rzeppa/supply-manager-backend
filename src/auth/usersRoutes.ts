import { NextFunction, Request, Response, Router } from "express";
import validateRequest from "../validation/requestValidation";
import Joi from "joi";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import authDatabase from "../database/auth/authDatabase";
import { generateAccessToken } from "./authTokens";
import bcrypt from "bcrypt";
import UserDto from "../dtos/user.dto";

const usersRoutes = Router();

usersRoutes.post(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequest(req, {
      body: Joi.object({
        name: Joi.string().required(),
        password: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    });
    if (validationError) return next(validationError);

    const name: string = req.body.name;
    const email: string = req.body.email;
    const password: string = req.body.password;

    // Check if user already exists
    const userExistsError = await authDatabase.isUserExisting({ email, name });
    if (userExistsError) return next(userExistsError);

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userError, user] = await catchPromiseError(
      authDatabase.createUser({
        email,
        password: hashedPassword,
        name,
        isVerified: false,
      })
    );
    if (userError) return next(userError);

    // TODO Send email to verify user

    const [tokenError, accessToken] = await catchPromiseError(
      generateAccessToken({
        name: user.name,
        id: user._id.toString(),
        email: user.email,
      })
    );
    if (tokenError) return next(tokenError);

    res.status(200).json({ accessToken });
  }
);

usersRoutes.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequest(req, {
      params: new Map([["id", Joi.string().required()]]),
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    });
    if (validationError) return next(validationError);

    const id: string = req.params.id;
    const body: Partial<Omit<UserDto, "password" | "id">> = req.body;

    const [userError, user] = await catchPromiseError(
      authDatabase.updateUser(id, body)
    );
    if (userError) return next(userError);

    res.status(200).json(user);
  }
);

usersRoutes.delete("/:id", async (req: Request, res: Response) => {
  // TODO Validate request
  // TODO Send email to verify user before deleting user
  // TODO Delete user from db
  // TODO Delete all products for user from db
  // TODO Delete all refresh tokens for user from db
  res.sendStatus(501);
});

export default usersRoutes;
