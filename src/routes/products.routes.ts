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
import authMiddleware from "../middlewares/authMiddleware";
import productsService from "../services/productsService";

const productsRoutes = Router();

productsRoutes.use(authMiddleware);

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

    res.status(204);
  }
);

export default productsRoutes;
