import { Router, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import Database from "../database/database";
import ResponseDto from "../dtos/response.dto";
import ProductDto from "../dtos/product.dto";
import { Product } from "../database/database.types";
import validateRequest from "../requestValidation/requestValidation";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import Joi from "joi";
import {
  createProductBodySchema,
  updateProductBodySchema,
} from "../requestValidation/productBodiesValidationSchemas";
import ValidationError from "../errors/validation/validationError";

// TODO middleware to check if user is authenticated and has access to product
// TODO validate request
// TODO logging
const getProductsRoutes = (db: Database) => {
  const productsRoutes = Router();

  productsRoutes.get(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
      const validationError = validateRequest(req, {
        headers: ["user_id"],
      });
      if (validationError) return next(validationError);

      const [dbError, products] = await catchPromiseError(
        db.getProductsByUserId(req.headers.user_id as string)
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
      const id = req.params.id;
      if (!id) return next(new ValidationError("Product id is required"));

      const [dbError, product] = await catchPromiseError(db.getProductById(id));
      if (dbError) return next(dbError);

      const productDtos: ProductDto = {
        id: product._id.toString(),
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: product.items,
      };

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
      const validationError = validateRequest(req, {
        headers: ["user_id"],
        body: createProductBodySchema,
      });
      if (validationError) return next(validationError);

      const productInfoToCreate = req.body as Omit<
        ProductDto,
        "id" | "items" | "user_id"
      >;
      const user_id = req.headers.user_id as string;

      const productToCreate: Omit<Product, "_id"> = {
        ...productInfoToCreate,
        user_id: new mongoose.Types.ObjectId(user_id),
        items: [],
      };

      const [dbError, newProduct] = await catchPromiseError(
        db.createProduct(productToCreate)
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
      const id = req.params.id;
      if (!id) return next(new ValidationError("Product id is required"));

      const validationError = validateRequest(req, {
        body: updateProductBodySchema,
      });
      if (validationError) return next(validationError);

      const productInfoToUpdate = req.body as Partial<
        Omit<ProductDto, "id" | "items" | "user_id">
      >;

      const [dbError, updatedProduct] = await catchPromiseError(
        db.updateProduct(id, {
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
      const id = req.params.id;
      if (!id) return next(new ValidationError("Product id is required"));

      const [error] = await catchPromiseError(db.deleteProductById(id));
      if (error) return next(error);

      const responseBody: ResponseDto<null> = {
        message: "Product deleted successfully",
      };
      res.status(200).json(responseBody);
    }
  );

  return productsRoutes;
};

export default getProductsRoutes;
