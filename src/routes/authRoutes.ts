import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";

import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import usersRoutes from "./usersRoutes";
import authService from "../services/authService";

const authRoutes = Router();

authRoutes.use("/users", usersRoutes);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns an access token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@mail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
authRoutes.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequest(req, {
      body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      }),
    });
    if (validationError) return next(validationError);

    const email: string = req.body.email;
    const password: string = req.body.password;

    const [error, accessToken] = await catchPromiseError(
      authService.login(email, password)
    );
    if (error) return next(error);

    res.status(200).json({ accessToken: accessToken });
  }
);

/**
 * @swagger
 * /logout:
 *   delete:
 *     summary: User logout
 *     description: Logs out a user by deleting their access token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *     responses:
 *       204:
 *         description: Successfully logged out
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
authRoutes.delete(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequest(req, {
      body: Joi.object({
        token: Joi.string().required(),
      }),
    });
    if (validationError) return next(validationError);

    const token: string = req.body.token;

    const [error] = await catchPromiseError(authService.logout(token));
    if (error) return next(error);

    res.sendStatus(204);
  }
);

export default authRoutes;
