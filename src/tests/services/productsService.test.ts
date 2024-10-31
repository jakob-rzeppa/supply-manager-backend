import productsService from "../../services/productsService";
import database from "../../database/database";
import mongoose from "mongoose";
import { Product } from "../../database/product/productDatabase.types";
import ProductDto from "../../dtos/product.dto";
import ItemDto from "../../dtos/item.dto";

jest.mock("../../database/database");

describe("productsService", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const productId = new mongoose.Types.ObjectId().toString();
  const item: ItemDto = { expiration_date: new Date() };
  let product: Product = {
    _id: new mongoose.Types.ObjectId(),
    ean: "1234567890123",
    user_id: new mongoose.Types.ObjectId(userId),
    name: "Test Product",
    description: "Test Description",
    items: [item],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    product = {
      _id: new mongoose.Types.ObjectId(),
      ean: "1234567890123",
      user_id: new mongoose.Types.ObjectId(userId),
      name: "Test Product",
      description: "Test Description",
      items: [item],
    };
  });

  describe("getProductsByUserId", () => {
    it("should return an array of ProductDto", async () => {
      jest.spyOn(database.products, "getProducts").mockResolvedValue([product]);

      const result = await productsService.getProductsByUserId(userId);

      expect(result).toEqual([
        {
          id: product._id.toString(),
          ean: product.ean,
          user_id: product.user_id.toString(),
          name: product.name,
          description: product.description,
          items: [item],
        },
      ]);
    });

    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "getProducts")
        .mockRejectedValue(new Error());

      await expect(
        productsService.getProductsByUserId(userId)
      ).rejects.toThrow();
    });
  });

  describe("getProductByIdAndUserId", () => {
    it("should return a ProductDto", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);

      const result = await productsService.getProductByIdAndUserId(
        productId,
        userId
      );

      expect(result).toEqual({
        id: product._id.toString(),
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: [item],
      });
    });

    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockRejectedValue(new Error());

      await expect(
        productsService.getProductByIdAndUserId(productId, userId)
      ).rejects.toThrow();
    });
  });

  describe("createProduct", () => {
    const productInfo: Omit<ProductDto, "id" | "items" | "user_id"> = {
      ean: "1234567890123",
      name: "Test Product",
      description: "Test Description",
    };

    it("should return a ProductDto", async () => {
      jest.spyOn(database.products, "createProduct").mockResolvedValue(product);

      const result = await productsService.createProduct(userId, productInfo);

      expect(result).toEqual(product._id.toString());
    });

    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "createProduct")
        .mockRejectedValue(new Error());

      await expect(
        productsService.createProduct(userId, productInfo)
      ).rejects.toThrow();
    });
  });

  describe("updateProduct", () => {
    const productInfo: Partial<Omit<ProductDto, "id" | "items" | "user_id">> = {
      ean: "1234567890123",
      name: "Test Product",
      description: "Test Description",
    };

    it("should return a ProductDto", async () => {
      jest.spyOn(database.products, "updateProduct").mockResolvedValue(product);

      const result = await productsService.updateProduct(
        productId,
        userId,
        productInfo
      );

      expect(result).toEqual({
        id: product._id.toString(),
        ean: product.ean,
        user_id: product.user_id.toString(),
        name: product.name,
        description: product.description,
        items: [item],
      });
    });

    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "updateProduct")
        .mockRejectedValue(new Error());

      await expect(
        productsService.updateProduct(productId, userId, productInfo)
      ).rejects.toThrow();
    });
  });

  describe("deleteProductById", () => {
    it("should not throw an error if the database call is successful", async () => {
      jest.spyOn(database.products, "deleteProductById").mockResolvedValue();

      await expect(
        productsService.deleteProductByid(productId, userId)
      ).resolves.not.toThrow();
    });

    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "deleteProductById")
        .mockRejectedValue(new Error());

      await expect(
        productsService.deleteProductByid(productId, userId)
      ).rejects.toThrow();
    });
  });

  describe("addProductItem", () => {
    it("should return an array of ItemDto", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);
      jest.spyOn(database.products, "updateProduct").mockResolvedValue(product);

      const result = await productsService.addProductItem(
        productId,
        userId,
        item
      );

      expect(result).toEqual([item, item]);
    });

    it("should throw an error if the database call to getProductById fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockRejectedValue(new Error());

      await expect(
        productsService.addProductItem(productId, userId, item)
      ).rejects.toThrow();
    });

    it("should throw an error if the database call to updateProduct fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);
      jest
        .spyOn(database.products, "updateProduct")
        .mockRejectedValue(new Error());

      await expect(
        productsService.addProductItem(productId, userId, item)
      ).rejects.toThrow();
    });
  });

  describe("updateProductItem", () => {
    const updatedItem: ItemDto = { expiration_date: new Date(2026) };

    it("should return an array of ItemDto", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);
      jest.spyOn(database.products, "updateProduct").mockResolvedValue(product);

      const result = await productsService.updateProductItem(
        productId,
        userId,
        0,
        updatedItem
      );

      expect(result).toEqual([updatedItem]);
    });

    it("should throw an error if the database call to getProductById fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockRejectedValue(new Error());

      await expect(
        productsService.updateProductItem(productId, userId, 0, updatedItem)
      ).rejects.toThrow();
    });

    it("should throw an error if the database call to updateProduct fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);
      jest
        .spyOn(database.products, "updateProduct")
        .mockRejectedValue(new Error());

      await expect(
        productsService.updateProductItem(productId, userId, 0, updatedItem)
      ).rejects.toThrow();
    });

    it("should throw an error if the item index is out of bounds", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);

      await expect(
        productsService.updateProductItem(productId, userId, 1, updatedItem)
      ).rejects.toThrow();
    });
  });

  describe("deleteProductItem", () => {
    it("should throw an error if the database call fails", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockRejectedValue(new Error());

      await expect(
        productsService.deleteProductItem(productId, userId, 0)
      ).rejects.toThrow();
    });

    it("should throw an error if the item index is out of bounds", async () => {
      jest
        .spyOn(database.products, "getProductById")
        .mockResolvedValue(product);

      await expect(
        productsService.deleteProductItem(productId, userId, 1)
      ).rejects.toThrow();
    });
  });
});
