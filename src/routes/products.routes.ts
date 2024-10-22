import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import database from "../database/database";
import ResponseDto from "../dtos/response.dto";
import ProductDto from "../dtos/product.dto";
import { Product } from "../database/product/productDatabase.types";
import validateRequest from "../validation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import {
  createProductBodySchema,
  idSchema,
  updateProductBodySchema,
} from "../validation/productValidationSchemas";
import validateLocals from "../validation/localsValidation";
import Joi from "joi";
import { userSchema } from "../validation/userValidationSchemas";
import AuthorisationError from "../errors/auth/authorisationError";
import authMiddleware from "../auth/authMiddleware";

// TODO logging
const productsRoutes = Router();

productsRoutes.use(authMiddleware);

productsRoutes.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateLocals(
        res,
        Joi.object({ user: userSchema })
      );
      if (validationError) return next(validationError);
    }

    const userId: string = res.locals.user.id;

    const [dbError, products] = await catchPromiseError(
      database.products.getProductByUserId(userId as string)
    );
    if (dbError) return next(dbError);

    const productDtos: ProductDto[] = products.map((product) => {
      return {
        id: product._id.toString(),
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: product.items,
      };
    });

    const responseBody: ResponseDto<ProductDto[]> = {
      message: "Products retrieved successfully",
      data: productDtos,
    };

    res.status(200).json(responseBody);
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

    const user_id: string = res.locals.user.id;
    const id: string = req.params.id;

    const [dbError, product] = await catchPromiseError(
      database.products.getProductById(id)
    );
    if (dbError) return next(dbError);

    const productDtos: ProductDto = {
      id: product._id.toString(),
      ean: product.ean,
      user_id: product.user_id.toString(),
      name: product.name,
      description: product.description,
      items: product.items,
    };

    if (user_id !== product.user_id.toString())
      return next(
        new AuthorisationError("User does not have access to this product")
      );

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product retrieved successfully",
      data: productDtos,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.post(
  "/",
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

    const userId: string = res.locals.user.id;
    const productInfoToCreate: Omit<ProductDto, "id" | "items" | "user_id"> =
      req.body;

    const productToCreate: Omit<Product, "_id"> = {
      ...productInfoToCreate,
      user_id: new mongoose.Types.ObjectId(userId),
      items: [],
    };

    const [dbError, newProduct] = await catchPromiseError(
      database.products.createProduct(productToCreate)
    );
    if (dbError) return next(dbError);

    const productDto: ProductDto = {
      id: newProduct._id.toString(),
      ean: newProduct.ean,
      user_id: newProduct.user_id.toString(),
      name: newProduct.name,
      description: newProduct.description,
      items: newProduct.items,
    };

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product created succesfully",
      data: productDto,
    };

    res.status(201).json(responseBody);
  }
);

productsRoutes.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["id", idSchema]]),
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

    const userId: string = res.locals.user.id;
    const id: string = req.params.id;
    const productInfoToUpdate: Partial<
      Omit<ProductDto, "id" | "items" | "user_id">
    > = req.body;

    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(id, {
        ean: productInfoToUpdate.ean,
        name: productInfoToUpdate.name,
        description: productInfoToUpdate.description,
      })
    );
    if (dbError) return next(dbError);

    const productDto: ProductDto = {
      id: updatedProduct._id.toString(),
      ean: updatedProduct.ean,
      user_id: updatedProduct.user_id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      items: updatedProduct.items,
    };

    if (userId !== updatedProduct.user_id.toString())
      return next(
        new AuthorisationError("User does not have access to this product")
      );

    const responseBody: ResponseDto<ProductDto> = {
      message: "Product updated successfully",
      data: productDto,
    };

    res.status(200).json(responseBody);
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

    const userId: string = res.locals.user.id;
    const id: string = req.params.id;

    const [dbError, product] = await catchPromiseError(
      database.products.getProductById(id)
    );
    if (dbError) return next(dbError);

    if (userId !== product.user_id.toString())
      return next(
        new AuthorisationError("User does not have access to this product")
      );

    const [error] = await catchPromiseError(
      database.products.deleteProductById(id)
    );
    if (error) return next(error);

    //TODO: delete all items and products related to user

    const responseBody: ResponseDto<null> = {
      message: "Product deleted successfully",
    };
    res.status(200).json(responseBody);
  }
);

export default productsRoutes;
