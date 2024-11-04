import mongoose from "mongoose";

import database from "../database/database";
import ItemDto from "../dtos/item.dto";
import ProductDto from "../dtos/product.dto";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import { Product } from "../database/product/productDatabase.types";
import NotFoundError from "../errors/db/notFoundError";

export default {
  getProductsByUserId: async (userId: string) => {
    const [dbError, products] = await catchPromiseError(
      database.products.getProducts(userId as string)
    );
    if (dbError) throw dbError;

    const productDtos: ProductDto[] = products.map((product) => {
      return {
        id: product._id.toString(),
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: product.items.map((item) => {
          return { expiration_date: item.expiration_date } as ItemDto;
        }),
      };
    });

    return productDtos;
  },

  getProductByIdAndUserId: async (
    id: string,
    userId: string
  ): Promise<ProductDto> => {
    const [dbError, product] = await catchPromiseError(
      database.products.getProductById(id, userId)
    );
    if (dbError) throw dbError;

    const productDtos: ProductDto = {
      id: product._id.toString(),
      ean: product.ean,
      user_id: product.user_id.toString(),
      name: product.name,
      description: product.description,
      items: product.items.map((item) => {
        return { expiration_date: item.expiration_date } as ItemDto;
      }),
    };

    return productDtos;
  },

  createProduct: async (
    userId: string,
    productInfo: Omit<ProductDto, "id" | "items" | "user_id">
  ) => {
    const productToCreate: Omit<Product, "_id"> = {
      ...productInfo,
      user_id: new mongoose.Types.ObjectId(userId),
      items: [],
    };

    const [dbError, newProduct] = await catchPromiseError(
      database.products.createProduct(productToCreate)
    );
    if (dbError) throw dbError;

    return newProduct._id.toString();
  },

  updateProduct: async (
    id: string,
    userId: string,
    productInfoToUpdate: Partial<Omit<ProductDto, "id" | "items" | "user_id">>
  ) => {
    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(id, userId, productInfoToUpdate)
    );
    if (dbError) throw dbError;

    const productDto: ProductDto = {
      id: updatedProduct._id.toString(),
      ean: updatedProduct.ean,
      user_id: updatedProduct.user_id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      items: updatedProduct.items,
    };

    return productDto;
  },

  deleteProductByid: async (id: string, userId: string) => {
    const [error] = await catchPromiseError(
      database.products.deleteProductById(id, userId)
    );
    if (error) throw error;
  },

  addProductItem: async (id: string, userId: string, item: ItemDto) => {
    const [error, product] = await catchPromiseError(
      database.products.getProductById(id, userId)
    );
    if (error) throw error;

    const items = product.items;

    items.push(item);

    items.sort(
      (a, b) =>
        new Date(a.expiration_date).getTime() -
        new Date(b.expiration_date).getTime()
    );

    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(id, userId, { items })
    );
    if (dbError) throw dbError;

    return updatedProduct.items as ItemDto[];
  },

  deleteProductItem: async (
    id: string,
    userId: string,
    expiration_date: string
  ) => {
    const [error, product] = await catchPromiseError(
      database.products.getProductById(id, userId)
    );
    if (error) throw error;

    const items = product.items;

    const itemIndex = items.findIndex(
      (item) =>
        item.expiration_date.toUTCString() ===
        new Date(expiration_date).toUTCString()
    );

    if (itemIndex === -1) {
      throw new NotFoundError("Item not found");
    }

    const newItems = items
      .slice(0, itemIndex)
      .concat(items.slice(itemIndex + 1));

    const [dbError, newProduct] = await catchPromiseError(
      database.products.updateProduct(id, userId, { items: newItems })
    );
    if (dbError) throw dbError;

    return newProduct.items as ItemDto[];
  },
};
