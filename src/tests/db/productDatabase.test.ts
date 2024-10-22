import mongoose from "mongoose";

import { ProductModel } from "../../database/database.models";
import { Product } from "../../database/product/productDatabase.types";
import productDatabase from "../../database/product/productDatabase";

const mockId = "ffffffffffffffffffffffff";

const mockProduct: Product = {
  _id: new mongoose.Types.ObjectId(mockId),
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
        mockId,
        mockProduct.ean
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
        mockId,
        mockProduct.ean
      );
      expect(exists).toBe(false);
      expect(mock).toHaveBeenCalledWith({
        user_id: mockId,
        ean: mockProduct.ean,
      });
    });
  });

  describe("getProductsByUserId", () => {
    it("should call ProductModel.find with the correct userId and return products", async () => {
      const mock = jest
        .spyOn(ProductModel, "find")
        .mockResolvedValueOnce([mockProduct]);
      const products = await productDatabase.getByUserId(mockId);
      expect(products).toEqual([mockProduct]);
      expect(mock).toHaveBeenCalledWith({ user_id: mockId });
    });
  });

  describe("getProductById", () => {
    it("should call ProductModel.findById with the correct id and return a product", async () => {
      const mock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(mockProduct);
      const product = await productDatabase.getById(mockId);
      expect(product).toEqual(mockProduct);
      expect(mock).toHaveBeenCalledWith(mockId);
    });
    it("should throw a NotFoundError if ProductModel.findById returns null", async () => {
      const mock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(null);
      await expect(productDatabase.getById(mockId)).rejects.toThrow(
        "Product not found"
      );
      expect(mock).toHaveBeenCalledWith(mockId);
    });
  });

  describe("getProductByEanAndUserId", () => {
    it("should call ProductModel.findOne with the correct ean and userId and return a product", async () => {
      const mock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValueOnce(mockProduct);
      const product = await productDatabase.getByEanAndUserId(
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
        productDatabase.getByEanAndUserId(mockProduct.ean, mockId)
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
      const product = await productDatabase.create(mockProduct);
      expect(product).toEqual(mockProduct);
      expect(saveMock).toHaveBeenCalled();
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        mockProduct.ean
      );
    });
    it("should throw a ResourceAlreadyExistsError if ean already exists for user", async () => {
      const mock = jest
        .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(true);
      await expect(productDatabase.create(mockProduct)).rejects.toThrow(
        "Product with this EAN already exists for this user"
      );
      expect(mock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        mockProduct.ean
      );
    });
  });

  describe("updateProduct", () => {
    it("should call ProductModel.findById with the correct id and update the product", async () => {
      const mockUpdatedProduct = {
        name: "newName",
        ean: "newEan",
        description: "newDescription",
        user_id: new mongoose.Types.ObjectId(mockId),
      };
      let product = new ProductModel(mockProduct);

      const findByIdMock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(product);
      const checkIfEanAlreadyExistsForUserMock = jest
        .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(false);
      const saveMock = jest
        .spyOn(ProductModel.prototype, "save")
        .mockResolvedValueOnce(product);

      const updatedProduct = await productDatabase.update(
        mockId,
        mockUpdatedProduct
      );

      expect(updatedProduct).toEqual(product);
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        mockUpdatedProduct.ean
      );
      expect(saveMock).toHaveBeenCalled();
    });
    it("should throw a NotFoundError if ProductModel.findById returns null", async () => {
      const findByIdMock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(null);
      const updateProductObject = { name: "newName", ean: "newEan" };
      await expect(
        productDatabase.update(mockId, updateProductObject)
      ).rejects.toThrow("Product not found");
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
    });
    it("should throw a ResourceAlreadyExistsError if ean already exists for user", async () => {
      let product = new ProductModel(mockProduct);
      const findByIdMock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(product);
      const checkIfEanAlreadyExistsForUserMock = jest
        .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(true);
      const updateProductObject = { ean: "newEan", name: "newName" };
      await expect(
        productDatabase.update(mockId, updateProductObject)
      ).rejects.toThrow("Product with this EAN already exists for this user");
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        "newEan"
      );
    });
  });
  describe("deleteProductById", () => {
    it("should call ProductModel.deleteOne with the correct id", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);
      await productDatabase.deleteById(mockId);
      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockId });
    });
    it("should throw a NotFoundError if ProductModel.deleteOne returns deletedCount 0", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 0 } as any);
      await expect(productDatabase.deleteById(mockId)).rejects.toThrow(
        "Product not found"
      );
      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockId });
    });
  });
  describe("deleteProductByEanAndUserId", () => {
    it("should call ProductModel.deleteOne with the correct ean and userId", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);
      await productDatabase.deleteByEanAndUserId(
        mockProduct.ean,
        mockProduct.user_id.toString()
      );
      expect(deleteOneMock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockProduct.user_id.toString(),
      });
    });
    it("should throw a NotFoundError if ProductModel.deleteOne returns deletedCount 0", async () => {
      const deleteOneMock = jest
        .spyOn(ProductModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 0 } as any);
      await expect(
        productDatabase.deleteByEanAndUserId(
          mockProduct.ean,
          mockProduct.user_id.toString()
        )
      ).rejects.toThrow("Product not found");
      expect(deleteOneMock).toHaveBeenCalledWith({
        ean: mockProduct.ean,
        user_id: mockProduct.user_id.toString(),
      });
    });
  });
});
