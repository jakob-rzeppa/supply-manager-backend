import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";

import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import UserDto from "../dtos/user.dto";
import usersService from "../services/usersService";

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

    const [error, accessToken] = await catchPromiseError(
      usersService.createUser(name, email, password)
    );
    if (error) return next(error);

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

    const [error, user] = await catchPromiseError(
      usersService.updateUser(id, body)
    );
    if (error) return next(error);

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
