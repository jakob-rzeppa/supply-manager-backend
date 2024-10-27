import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import database from "../database/database";
import ResponseDto from "../dtos/response.dto";
import ProductDto from "../dtos/product.dto";
import { Product } from "../database/product/productDatabase.types";
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
import Joi from "joi";
import { userSchema } from "../validation/userValidationSchemas";
import AuthorisationError from "../errors/auth/authorisationError";
import authMiddleware from "../auth/authMiddleware";
import ItemDto from "../dtos/item.dto";

// TODO logging
const productsRoutes = Router();

productsRoutes.use(authMiddleware);

productsRoutes.get(
  "",
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
      database.products.getProducts(userId as string)
    );
    if (dbError) return next(dbError);

    const productDtos: ProductDto[] = products.map((product) => {
      return {
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: product.items.map((item) => {
          return { expiration_date: item.expiration_date } as ItemDto;
        }),
      };
    });

    console.log(productDtos);

    const responseBody: ResponseDto<ProductDto[]> = {
      message: "Products retrieved successfully",
      data: productDtos,
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.get(
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
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
    const ean: string = req.params.ean;

    const [dbError, product] = await catchPromiseError(
      database.products.getProductByEan(ean, user_id)
    );
    if (dbError) return next(dbError);

    const productDtos: ProductDto = {
      ean: product.ean,
      user_id: product.user_id.toString(),
      name: product.name,
      description: product.description,
      items: product.items.map((item) => {
        return { expiration_date: item.expiration_date } as ItemDto;
      }),
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
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
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
    const ean: string = req.params.ean;
    const productInfoToUpdate: Partial<
      Omit<ProductDto, "id" | "items" | "user_id">
    > = req.body;

    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(ean, userId, {
        name: productInfoToUpdate.name,
        description: productInfoToUpdate.description,
      })
    );
    if (dbError) return next(dbError);

    const productDto: ProductDto = {
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
  "/:ean",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
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
    const ean: string = req.params.ean;

    const [error] = await catchPromiseError(
      database.products.deleteProductByEan(ean, userId)
    );
    if (error) return next(error);

    const responseBody: ResponseDto<null> = {
      message: "Product deleted successfully",
    };
    res.status(200).json(responseBody);
  }
);

productsRoutes.post(
  "/:ean/items",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([["ean", eanSchema]]),
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

    const ean: string = req.params.ean;
    const userId: string = res.locals.user.id;
    const item: ItemDto = req.body;

    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (error) return next(error);

    const items = product.items;

    items.push(item);

    items.sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
    );

    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(ean, userId, { items })
    );
    if (dbError) return next(dbError);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Item added successfully",
      data: {
        ean: updatedProduct.ean,
        user_id: updatedProduct.user_id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        items: updatedProduct.items.map((item) => {
          return { expiration_date: item.expiration_date } as ItemDto;
        }),
      },
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.put(
  "/:ean/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["ean", eanSchema],
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

    const ean: string = req.params.ean;
    const userId: string = res.locals.user.id;
    const index: number = parseInt(req.params.index);
    const item: ItemDto = req.body;

    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (error) return next(error);

    const items = product.items;

    items[index] = item;

    items.sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
    );

    const [dbError] = await catchPromiseError(
      database.products.updateProduct(ean, userId, { items })
    );
    if (dbError) return next(dbError);

    const responseBody: ResponseDto<ProductDto> = {
      message: "Item updated successfully",
      data: {
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: product.items.map((item) => {
          return { expiration_date: item.expiration_date } as ItemDto;
        }),
      },
    };

    res.status(200).json(responseBody);
  }
);

productsRoutes.delete(
  "/:ean/items/:index",
  async (req: Request, res: Response, next: NextFunction) => {
    {
      const validationError = validateRequest(req, {
        params: new Map([
          ["ean", eanSchema],
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

    const ean: string = req.params.ean;
    const userId: string = res.locals.user.id;
    const index: number = parseInt(req.params.index);

    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (error) return next(error);

    const items = product.items;

    items.splice(index, 1);

    const [dbError] = await catchPromiseError(
      database.products.updateProduct(ean, userId, { items })
    );
    if (dbError) return next(dbError);

    const responseBody: ResponseDto<null> = {
      message: "Item deleted successfully",
    };

    res.status(200).json(responseBody);
  }
);

export default productsRoutes;
