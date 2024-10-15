import { Router, Request, Response } from "express";
import boom from "boom";
import mongoose from "mongoose";

import Database from "../database/database";
import ResponseDto from "../dtos/response.dto";
import ProductDto from "../dtos/product.dto";
import { Product } from "../database/database.types";

// TODO middleware to check if user is authenticated and has access to product
// TODO validate request
// TODO logging
const getProductsRoutes = (db: Database) => {
  const productsRoutes = Router();

  productsRoutes.get("/", async (req: Request, res: Response) => {
    const products = await db.getProductsByUserId(
      req.headers.user_id as string
    );

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
  });

  productsRoutes.get("/:id", async (req: Request, res: Response) => {
    const product = await db.getProductById(req.params.id);

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
  });

  productsRoutes.post("/", async (req: Request, res: Response) => {
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

    const newProduct = await db.createProduct(productToCreate);

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
  });

  productsRoutes.put("/:id", async (req: Request, res: Response) => {
    const productInfoToUpdate = req.body as Partial<
      Omit<ProductDto, "id" | "items" | "user_id">
    >;
    const id = req.params.id;

    const updatedProduct = await db.updateProduct(id, {
      ean: productInfoToUpdate.ean,
      name: productInfoToUpdate.name,
      description: productInfoToUpdate.description,
    });

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
  });

  productsRoutes.delete("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;

    await db.deleteProductById(id);

    const responseBody: ResponseDto<null> = {
      message: "Product deleted successfully",
    };
    res.status(204).json(responseBody);
  });

  return productsRoutes;
};

export default getProductsRoutes;
