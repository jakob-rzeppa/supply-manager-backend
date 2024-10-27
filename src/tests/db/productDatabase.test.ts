import mongoose from "mongoose";

import { ProductModel } from "../../database/product/productDatabase.models";
import { Product } from "../../database/product/productDatabase.types";
import productDatabase from "../../database/product/productDatabase";

const mockId = "ffffffffffffffffffffffff";

const mockProduct: Product = {
  name: "test",
  description: "test",
  user_id: new mongoose.Types.ObjectId(mockId),
  items: [],
  ean: "1234567890123",
};

describe("productDatabase", () => {
  describe("checkIfEanAlreadyExistsForUser", () => {
    it("should call ProductModel.findOne with the correct userId and ean and return true if product exists", async () => {
      const mock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(mockProduct);
      const exists = await productDatabase.checkIfEanAlreadyExistsForUser(
        mockProduct.ean,
        mockId
      );
      expect(exists).toBe(true);
      expect(mock).toHaveBeenCalledWith({
        user_id: mockId,
        ean: mockProduct.ean,
      });
    });

    it("should return false if ProductModel.findOne returns null", async () => {
      const mock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(null);
      const exists = await productDatabase.checkIfEanAlreadyExistsForUser(
        mockProduct.ean,
        mockId
      );
      expect(exists).toBe(false);
      expect(mock).toHaveBeenCalledWith({
        user_id: mockId,
        ean: mockProduct.ean,
      });
    });
  });

  describe("getProducts", () => {
    it("should call ProductModel.find with the correct userId and return products", async () => {
      const mock = jest
        .spyOn(ProductModel, "find")
        .mockResolvedValueOnce([mockProduct]);
      const products = await productDatabase.getProducts(mockId);
      expect(products).toEqual([mockProduct]);
      expect(mock).toHaveBeenCalledWith({ user_id: mockId });
    });
  });

  describe("getProductByEan", () => {
    it("should call ProductModel.findOne with the correct ean and userId and return a product", async () => {
      const mock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(mockProduct);
      const product = await productDatabase.getProductByEan(
        mockProduct.ean,
        mockProduct.user_id.toString()
      );
      expect(product).toEqual(mockProduct);
      expect(mock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockProduct.user_id.toString(),
      });
    });
    it("should throw a NotFoundError if ProductModel.findOne returns null", async () => {
      const mock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(null);
      await expect(
        productDatabase.getProductByEan(mockProduct.ean, mockId)
      ).rejects.toThrow("Product not found");
      expect(mock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockId,
      });
    });
  });

  describe("createProduct", () => {
    it("should create a new product and return it", async () => {
      const saveMock = jest
        .spyOn(ProductModel.prototype, "save")
        .mockResolvedValueOnce(mockProduct);
      const checkIfEanAlreadyExistsForUserMock = jest
        .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(false);
      const product = await productDatabase.createProduct(mockProduct);
      expect(product).toEqual(mockProduct);
      expect(saveMock).toHaveBeenCalled();
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.ean,
        mockProduct.user_id.toString()
      );
    });
    it("should throw a ResourceAlreadyExistsError if ean already exists for user", async () => {
      const mock = jest
        .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(true);
      await expect(productDatabase.createProduct(mockProduct)).rejects.toThrow(
        "Product with this EAN already exists for this user"
      );
      expect(mock).toHaveBeenCalledWith(
        mockProduct.ean,
        mockProduct.user_id.toString()
      );
    });
  });

  describe("updateProduct", () => {
    it("should update a product and return it", async () => {
      const saveMock = jest
        .spyOn(ProductModel.prototype, "save")
        .mockResolvedValueOnce(mockProduct);
      const findOneMock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(new ProductModel(mockProduct));
      const product = await productDatabase.updateProduct(
        mockProduct.ean,
        mockId,
        mockProduct
      );
      expect(product).toEqual(mockProduct);
      expect(saveMock).toHaveBeenCalled();
      expect(findOneMock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockId,
      });
    });

    it("should throw a NotFoundError if getProductByEan returns null", async () => {
      const findOneMock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(null);
      await expect(
        productDatabase.updateProduct(
          mockProduct.ean,
          mockProduct.user_id.toString(),
          mockProduct
        )
      ).rejects.toThrow("Product not found");
      expect(findOneMock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockProduct.user_id.toString(),
      });
    });
  });

  describe("deleteProductByEan", () => {
    it("should call ProductModel.deleteOne with the correct ean and userId", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);
      await productDatabase.deleteProductByEan("ean", "userId");
      expect(deleteOneMock).toHaveBeenCalledWith({
        ean: "ean",
        user_id: "userId",
      });
    });

    it("should throw a NotFoundError if ProductModel.deleteOne returns deletedCount 0", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 0 } as any);
      await expect(
        productDatabase.deleteProductByEan("ean", "userId")
      ).rejects.toThrow("Product not found");
      expect(deleteOneMock).toHaveBeenCalledWith({
        ean: "ean",
        user_id: "userId",
      });
    });
  });
});
