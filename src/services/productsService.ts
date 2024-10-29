import mongoose from "mongoose";

import database from "../database/database";
import ItemDto from "../dtos/item.dto";
import ProductDto from "../dtos/product.dto";
import { catchPromiseError } from "../utilityFunctions/errorHandling";
import { Product } from "../database/product/productDatabase.types";

export default {
  getProductsByUserId: async (userId: string) => {
    const [dbError, products] = await catchPromiseError(
      database.products.getProducts(userId as string)
    );
    if (dbError) throw dbError;

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

    return productDtos;
  },

  getProductByEanAndUserId: async (
    ean: string,
    userId: string
  ): Promise<ProductDto> => {
    const [dbError, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (dbError) throw dbError;

    const productDtos: ProductDto = {
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

    const productDto: ProductDto = {
      ean: newProduct.ean,
      user_id: newProduct.user_id.toString(),
      name: newProduct.name,
      description: newProduct.description,
      items: newProduct.items,
    };

    return productDto;
  },

  updateProduct: async (
    ean: string,
    userId: string,
    productInfoToUpdate: Partial<Omit<ProductDto, "id" | "items" | "user_id">>
  ) => {
    const [dbError, updatedProduct] = await catchPromiseError(
      database.products.updateProduct(ean, userId, {
        name: productInfoToUpdate.name,
        description: productInfoToUpdate.description,
      })
    );
    if (dbError) throw dbError;

    const productDto: ProductDto = {
      ean: updatedProduct.ean,
      user_id: updatedProduct.user_id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      items: updatedProduct.items,
    };

    return productDto;
  },

  deleteProductByEan: async (ean: string, userId: string) => {
    const [error] = await catchPromiseError(
      database.products.deleteProductByEan(ean, userId)
    );
    if (error) throw error;
  },

  addProductItem: async (ean: string, userId: string, item: ItemDto) => {
    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
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
      database.products.updateProduct(ean, userId, { items })
    );
    if (dbError) throw dbError;

    return {
      ean: updatedProduct.ean,
      user_id: updatedProduct.user_id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      items: updatedProduct.items.map((item) => {
        return { expiration_date: item.expiration_date } as ItemDto;
      }),
    } as ProductDto;
  },

  updateProductItem: async (
    ean: string,
    userId: string,
    index: number,
    item: ItemDto
  ) => {
    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (error) throw error;

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
    if (dbError) throw dbError;

    return {
      ean: product.ean,
      user_id: product.user_id.toString(),
      name: product.name,
      description: product.description,
      items: product.items.map((item) => {
        return { expiration_date: item.expiration_date } as ItemDto;
      }),
    } as ProductDto;
  },

  deleteProductItem: async (ean: string, userId: string, index: number) => {
    const [error, product] = await catchPromiseError(
      database.products.getProductByEan(ean, userId)
    );
    if (error) throw error;

    const items = product.items;

    items.splice(index, 1);

    const [dbError] = await catchPromiseError(
      database.products.updateProduct(ean, userId, { items })
    );
    if (dbError) throw dbError;
  },
};
