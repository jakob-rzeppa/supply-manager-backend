import { NextFunction, Request, Response, Router } from "express";
import Joi from "joi";

import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import UserDto from "../dtos/user.dto";
import usersService from "../services/usersService";

const usersRoutes = Router();

/**
 * @swagger
 * /auth/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user and return an access token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@mail.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Successfully created user
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
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /auth/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update a user's details
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: John
 *               email:
 *                 type: string
 *                 format: email
 *                 nullable: true
 *                 example: john@mail.com
 *     responses:
 *       204:
 *         description: Successfully updated user
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
usersRoutes.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const validationError = validateRequest(req, {
      params: new Map([["id", Joi.string().required()]]),
      body: Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().email().optional(),
      }),
    });
    if (validationError) return next(validationError);

    const id: string = req.params.id;
    const body: Partial<Omit<UserDto, "password" | "id">> = req.body;

    const [error] = await catchPromiseError(usersService.updateUser(id, body));
    if (error) return next(error);

    res.sendStatus(204);
  }
);

/**
 * @swagger
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user and all associated products
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: Successfully deleted user
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
usersRoutes.delete("/:id", async (req: Request, res: Response) => {
  // TODO Validate request
  // TODO Send email to verify user before deleting user
  // TODO Delete user from db
  // TODO Delete all products for user from db
  // TODO Delete all refresh tokens for user from db
  res.sendStatus(501);
});

export default usersRoutes;
