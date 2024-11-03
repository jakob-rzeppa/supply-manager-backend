/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";

import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import {
  createItemBodySchema,
  createProductBodySchema,
  eanSchema,
  idSchema,
  updateProductBodySchema,
} from "../validation/productValidationSchemas";
import validateLocals from "../validation/localsValidation";
import { userSchema } from "../validation/userValidationSchemas";
import productsService from "../services/productsService";

const productsRoutes = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *          error:
 *            type: string
 *            description: The error message
 *            example: An error occurred
 *     Item:
 *       type: object
 *       properties:
 *         expiration_date:
 *           type: string
 *           format: date
 *           description: The item expiration date
 *           example: 2022-12-31
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The product ID
 *           example: 123456789012345678901234
 *         user_id:
 *           type: string
 *           description: The user ID
 *           example: 123456789012345678901234
 *         ean:
 *           type: string
 *           description: The product EAN
 *           example: 1234567890123
 *         name:
 *           type: string
 *           description: The product name
 *           example: exampleProduct
 *         description:
 *           type: string
 *           description: The product description
 *           nullable: true
 *           example: exampleDescription
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products for the authenticated user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No products found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.get(
  "",
  async (_req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDtos] = await catchPromiseError(
      productsService.getProductsByUserId(res.locals.user.id)
    );
    if (error) return next(error);

    res.status(200).json({ products: productDtos });
  }
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID for the authenticated user
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["id", idSchema]]),
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.getProductByIdAndUserId(req.params.id, res.locals.user.id)
    );
    if (error) return next(error);

    res.status(200).json(productDto);
  }
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ean:
 *                 type: string
 *                 description: The product EAN
 *                 example: 1234567890123
 *               name:
 *                 type: string
 *                 description: The product name
 *                 example: exampleProduct
 *               description:
 *                 type: string
 *                 description: The product description
 *                 example: exampleDescription
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.post(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        body: createProductBodySchema,
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productId] = await catchPromiseError(
      productsService.createProduct(res.locals.user.id, req.body)
    );
    if (error) return next(error);

    res.status(201).json({ id: productId });
  }
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ean:
 *                 type: string
 *                 description: The product EAN
 *                 required: false
 *                 example: 1234567890123
 *               name:
 *                 type: string
 *                 description: The product name
 *                 required: false
 *                 example: exampleProduct
 *               description:
 *                 type: string
 *                 description: The product description
 *                 required: false
 *                 example: exampleDescription
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["id", eanSchema]]),
        body: updateProductBodySchema,
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, productDto] = await catchPromiseError(
      productsService.updateProduct(req.params.id, res.locals.user.id, req.body)
    );
    if (error) return next(error);

    res.status(200).json(productDto);
  }
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["id", idSchema]]),
      });
      if (validationError) return next(validationError);
    }

    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error] = await catchPromiseError(
      productsService.deleteProductByid(req.params.id, res.locals.user.id)
    );
    if (error) return next(error);

    res.sendStatus(204);
  }
);

/**
 * @swagger
 * /products/{id}/items:
 *   post:
 *     summary: Add an item to a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: The item expiration date
 *                 example: 2022-12-31
 *     responses:
 *       200:
 *         description: Item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.post(
  "/:id/items",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["id", idSchema]]),
        body: createItemBodySchema,
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, updatedItems] = await catchPromiseError(
      productsService.addProductItem(
        req.params.id,
        res.locals.user.id,
        req.body
      )
    );
    if (error) return next(error);

    res.status(200).json({ items: updatedItems });
  }
);

/**
 * @swagger
 * /products/{id}/items/{index}:
 *   put:
 *     summary: Update an item in a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *       - in: path
 *         name: index
 *         schema:
 *           type: string
 *         required: true
 *         description: The item index
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiration_date:
 *                 type: string
 *                 format: date
 *                 description: The item expiration date
 *                 example: 2022-12-31
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.put(
  "/:id/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["id", idSchema],
          ["index", Joi.string().regex(/^\d+$/).required()],
        ]),
        body: createItemBodySchema,
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error, updatedItems] = await catchPromiseError(
      productsService.updateProductItem(
        req.params.id,
        res.locals.user.id,
        parseInt(req.params.index),
        req.body
      )
    );
    if (error) return next(error);

    res.status(200).json(updatedItems);
  }
);

/**
 * @swagger
 * /products/{id}/items/{index}:
 *   delete:
 *     summary: Delete an item from a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *       - in: path
 *         name: index
 *         schema:
 *           type: string
 *         required: true
 *         description: The item index
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
productsRoutes.delete(
  "/:id/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["id", idSchema],
          ["index", Joi.string().regex(/^\d+$/).required()],
        ]),
      });
      if (validationError) return next(validationError);
    }
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const [error] = await catchPromiseError(
      productsService.deleteProductItem(
        req.params.id,
        res.locals.user.id,
        parseInt(req.params.index)
      )
    );
    if (error) return next(error);

    res.sendStatus(204);
  }
);

export default productsRoutes;
