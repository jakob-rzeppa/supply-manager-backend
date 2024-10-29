import mongoose from "mongoose";

import { ProductModel } from "../../database/product/productDatabase.models";
import { Product } from "../../database/product/productDatabase.types";
import productDatabase from "../../database/product/productDatabase";
import e from "express";

const testProduct: Product = {
  _id: new mongoose.Types.ObjectId("123456789012345678901234"),
  ean: "1234567890123",
  user_id: new mongoose.Types.ObjectId("123456789012345678901234"),
  name: "Test Product",
  description: "Test Description",
  items: [],
};

describe("Product Database", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkIfEanAlreadyExistsForUser", () => {
    it("should return false if EAN is undefined", async () => {
      const result = await productDatabase.checkIfEanAlreadyExistsForUser(
        undefined,
        testProduct.user_id.toString()
      );
      expect(result).toBe(false);
    });

    it("should return false if EAN does not exist", async () => {
      const findOneMock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValue(null);

      const result = await productDatabase.checkIfEanAlreadyExistsForUser(
        "1234567890123",
        testProduct.user_id.toString()
      );

      expect(result).toBe(false);
      expect(findOneMock).toHaveBeenCalledWith({
        user_id: testProduct.user_id.toString(),
        ean: "1234567890123",
      });
    });

    it("should return true if EAN exists", async () => {
      const findOneMock = jest
        .spyOn(ProductModel, "findOne")
        .mockResolvedValue(testProduct);

      const result = await productDatabase.checkIfEanAlreadyExistsForUser(
        "1234567890123",
        testProduct.user_id.toString()
      );

      expect(result).toBe(true);
      expect(findOneMock).toHaveBeenCalledWith({
        user_id: testProduct.user_id.toString(),
        ean: "1234567890123",
      });
    });

    describe("getProducts", () => {
      it("should return products", async () => {
        const findMock = jest
          .spyOn(ProductModel, "find")
          .mockResolvedValue([testProduct]);

        const result = await productDatabase.getProducts(
          testProduct.user_id.toString()
        );

        expect(result).toEqual([testProduct]);
        expect(findMock).toHaveBeenCalledWith({
          user_id: testProduct.user_id.toString(),
        });
      });
    });

    describe("getProductById", () => {
      it("should return product", async () => {
        const findOneMock = jest
          .spyOn(ProductModel, "findOne")
          .mockResolvedValue(testProduct);

        const result = await productDatabase.getProductById(
          testProduct._id.toString(),
          testProduct.user_id.toString()
        );

        expect(result).toEqual(testProduct);
        expect(findOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
      });

      it("should throw NotFoundError if product does not exist", async () => {
        const findOneMock = jest
          .spyOn(ProductModel, "findOne")
          .mockResolvedValue(null);

        await expect(
          productDatabase.getProductById(
            testProduct._id.toString(),
            testProduct.user_id.toString()
          )
        ).rejects.toThrow("Product not found");

        expect(findOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
      });
    });

    describe("createProduct", () => {
      it("should create product", async () => {
        const checkIfEanAlreadyExistsForUserMock = jest
          .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
          .mockResolvedValue(false);
        const saveMock = jest
          .spyOn(ProductModel.prototype, "save")
          .mockResolvedValue(testProduct);

        const result = await productDatabase.createProduct(testProduct);

        expect(result).toEqual(testProduct);
        expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
          testProduct.ean,
          testProduct.user_id.toString()
        );
        expect(saveMock).toHaveBeenCalled();
      });

      it("should throw ResourceAlreadyExistsError if EAN already exists", async () => {
        const checkIfEanAlreadyExistsForUserMock = jest
          .spyOn(productDatabase, "checkIfEanAlreadyExistsForUser")
          .mockResolvedValue(true);

        await expect(
          productDatabase.createProduct(testProduct)
        ).rejects.toThrow("Product with this EAN already exists for this user");

        expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
          testProduct.ean,
          testProduct.user_id.toString()
        );
      });
    });

    describe("updateProduct", () => {
      it("should update product", async () => {
        const productModelMock = new ProductModel(testProduct);

        const findOneMock = jest
          .spyOn(ProductModel, "findOne")
          .mockResolvedValue(productModelMock);
        const saveMock = jest
          .spyOn(productModelMock, "save")
          .mockResolvedValue(productModelMock);

        const resultItem = { expiration_date: new Date() };

        const result = await productDatabase.updateProduct(
          testProduct._id.toString(),
          testProduct.user_id.toString(),
          {
            name: "New Name",
            description: "New Description",
            items: [resultItem],
            ean: "1234567890new",
          }
        );

        expect(result.name).toEqual("New Name");
        expect(result.description).toEqual("New Description");
        expect(result.items.length).toEqual(1);
        expect(result.items[0].expiration_date).toEqual(
          resultItem.expiration_date
        );
        expect(result.ean).toEqual("1234567890new");
        expect(result.user_id).toEqual(testProduct.user_id);

        expect(findOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
        expect(saveMock).toHaveBeenCalled();
      });

      it("should throw NotFoundError if product does not exist", async () => {
        const findOneMock = jest
          .spyOn(ProductModel, "findOne")
          .mockResolvedValue(null);

        await expect(
          productDatabase.updateProduct(
            testProduct._id.toString(),
            testProduct.user_id.toString(),
            { name: "New Name" }
          )
        ).rejects.toThrow("Product not found");

        expect(findOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
      });
    });

    describe("deleteProductById", () => {
      it("should delete product", async () => {
        const deleteOneMock = jest
          .spyOn(ProductModel, "deleteOne")
          .mockResolvedValue({ deletedCount: 1 } as any);

        await productDatabase.deleteProductById(
          testProduct._id.toString(),
          testProduct.user_id.toString()
        );

        expect(deleteOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
      });

      it("should throw NotFoundError if product does not exist", async () => {
        const deleteOneMock = jest
          .spyOn(ProductModel, "deleteOne")
          .mockResolvedValue({ deletedCount: 0 } as any);

        await expect(
          productDatabase.deleteProductById(
            testProduct._id.toString(),
            testProduct.user_id.toString()
          )
        ).rejects.toThrow("Product not found");

        expect(deleteOneMock).toHaveBeenCalledWith({
          _id: testProduct._id.toString(),
          user_id: testProduct.user_id.toString(),
        });
      });
    });
  });
});
