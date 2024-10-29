import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import "dotenv/config";

import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import usersRoutes from "./usersRoutes";
import authService from "../services/authService";
import ResponseDto from "../dtos/response.dto";

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

    const [error, accessToken] = await catchPromiseError(
      authService.login(email, password)
    );
    if (error) return next(error);

    const responseBody: ResponseDto<{ accessToken: string }> = {
      data: { accessToken: accessToken },
      message: "Sucessfully logged in",
    };

    res.status(200).json(responseBody);
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

    const token: string = req.body.token;

    const [error] = await catchPromiseError(authService.logout(token));
    if (error) return next(error);

    const responseBody: ResponseDto = { message: "Sucessfully logged out" };

    res.status(200).json(responseBody);
  }
);

export default authRoutes;
