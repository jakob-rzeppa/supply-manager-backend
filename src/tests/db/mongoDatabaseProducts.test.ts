import { ProductModel } from "../../database/mongoDatabase.models";
import MongoDatabase from "../../database/mongoDatabase";
import { Product, User } from "../../database/database.types";
import mongoose from "mongoose";

const mongoDatabase = new MongoDatabase();

const mockId = "ffffffffffffffffffffffff";

const mockProduct: Product = {
  _id: new mongoose.Types.ObjectId(mockId),
  name: "test",
  description: "test",
  user_id: new mongoose.Types.ObjectId(mockId),
  items: [],
  ean: "1234567890123",
};

describe("MongoDatabase Products", () => {
  describe("getProductsByUserId", () => {
    it("should call ProductModel.find with the correct userId and return products", async () => {
      const mock = jest
        .spyOn(ProductModel, "find")
        .mockResolvedValueOnce([mockProduct]);
      const products = await mongoDatabase.getProductsByUserId(mockId);
      expect(products).toEqual([mockProduct]);
      expect(mock).toHaveBeenCalledWith({ user_id: mockId });
    });
  });

  describe("getProductById", () => {
    it("should call ProductModel.findById with the correct id and return a product", async () => {
      const mock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(mockProduct);
      const product = await mongoDatabase.getProductById(mockId);
      expect(product).toEqual(mockProduct);
      expect(mock).toHaveBeenCalledWith(mockId);
    });
    it("should throw a NotFoundError if ProductModel.findById returns null", async () => {
      const mock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(null);
      await expect(mongoDatabase.getProductById(mockId)).rejects.toThrow(
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
      const product = await mongoDatabase.getProductByEanAndUserId(
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
        mongoDatabase.getProductByEanAndUserId(mockProduct.ean, mockId)
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
        .spyOn(mongoDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(false);
      const product = await mongoDatabase.createProduct(mockProduct);
      expect(product).toEqual(mockProduct);
      expect(saveMock).toHaveBeenCalled();
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        mockProduct.ean
      );
    });
    it("should throw a ResourceAlreadyExistsError if ean already exists for user", async () => {
      const mock = jest
        .spyOn(mongoDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(true);
      await expect(mongoDatabase.createProduct(mockProduct)).rejects.toThrow(
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
      };
      let product = new ProductModel(mockProduct);

      const findByIdMock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(product);
      const checkIfEanAlreadyExistsForUserMock = jest
        .spyOn(mongoDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(false);
      const saveMock = jest
        .spyOn(ProductModel.prototype, "save")
        .mockResolvedValueOnce(product);

      const updatedProduct = await mongoDatabase.updateProduct(
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
        mongoDatabase.updateProduct(mockId, updateProductObject)
      ).rejects.toThrow("Product not found");
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
    });
    it("should throw a ResourceAlreadyExistsError if ean already exists for user", async () => {
      let product = new ProductModel(mockProduct);
      const findByIdMock = jest
        .spyOn(ProductModel, "findById")
        .mockResolvedValueOnce(product);
      const checkIfEanAlreadyExistsForUserMock = jest
        .spyOn(mongoDatabase, "checkIfEanAlreadyExistsForUser")
        .mockResolvedValueOnce(true);
      const updateProductObject = { ean: "newEan", name: "newName" };
      await expect(
        mongoDatabase.updateProduct(mockId, updateProductObject)
      ).rejects.toThrow("Product with this EAN already exists for this user");
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
      expect(checkIfEanAlreadyExistsForUserMock).toHaveBeenCalledWith(
        mockProduct.user_id.toString(),
        "newEan"
      );
    });
  });
});
