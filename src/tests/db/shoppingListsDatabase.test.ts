import mongoose from "mongoose";
import { Product } from "../../database/product/productDatabase.types";
import { ShoppingList } from "../../database/shoppingLists/shoppingListsDatabase.types";
import { ShoppingListModel } from "../../database/shoppingLists/shoppingListsDatabase.models";
import shoppingListsDatabase from "../../database/shoppingLists/shoppingListsDatabase";
import NotFoundError from "../../errors/db/notFoundError";

const testProduct: Product = {
  _id: new mongoose.Types.ObjectId("123456789012345678901234"),
  ean: "1234567890123",
  user_id: new mongoose.Types.ObjectId("123456789012345678901234"),
  name: "Test Product",
  description: "Test Description",
  items: [],
};

const testShoppingList: ShoppingList = {
  _id: new mongoose.Types.ObjectId("123456789012345678901234"),
  user_id: new mongoose.Types.ObjectId("123456789012345678901234"),
  name: "Test Shopping List",
  description: "Test Description",
  products: [
    {
      product: testProduct,
      amount: 2,
    },
  ],
};

jest.mock("../../database/shoppingLists/shoppingListsDatabase.models");

describe("Shopping Lists Database", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getShoppingLists", () => {
    it("should return shopping lists", async () => {
      ShoppingListModel.find = jest.fn().mockReturnValue([testShoppingList]);

      const result = await shoppingListsDatabase.getShoppingLists(
        testShoppingList.user_id
      );

      expect(result).toEqual([testShoppingList]);
      expect(ShoppingListModel.find).toHaveBeenCalledWith({
        user_id: testShoppingList.user_id,
      });
    });
  });

  describe("getShoppingListById", () => {
    it("should return a shopping list", async () => {
      ShoppingListModel.findOne = jest.fn().mockReturnValue(testShoppingList);

      const result = await shoppingListsDatabase.getShoppingListById(
        testShoppingList._id,
        testShoppingList.user_id
      );

      expect(result).toEqual(testShoppingList);
      expect(ShoppingListModel.findOne).toHaveBeenCalledWith({
        _id: testShoppingList._id,
        user_id: testShoppingList.user_id,
      });
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      ShoppingListModel.findOne = jest.fn().mockReturnValue(null);

      await expect(
        shoppingListsDatabase.getShoppingListById(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));
      expect(ShoppingListModel.findOne).toHaveBeenCalledWith({
        _id: new mongoose.Types.ObjectId("123456789012345678901234"),
        user_id: testShoppingList.user_id,
      });
    });
  });

  describe("createShoppingList", () => {
    it("should create a shopping list", async () => {
      const newShoppingList = {
        user_id: testShoppingList.user_id,
        name: "New Shopping List",
        description: "New Description",
        products: [],
      };

      jest.spyOn(ShoppingListModel.prototype, "save").mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        ...newShoppingList,
      });

      const result = await shoppingListsDatabase.createShoppingList(
        newShoppingList
      );

      expect(result).toEqual({
        _id: expect.any(mongoose.Types.ObjectId),
        ...newShoppingList,
      });
    });
  });

  describe("updateShoppingList", () => {
    it("should update a shopping list", async () => {
      const updateShoppingList = {
        name: "Updated Shopping List",
        description: "Updated Description",
        products: [],
      };

      ShoppingListModel.findOneAndUpdate = jest.fn().mockReturnValue({
        ...testShoppingList,
        ...updateShoppingList,
      });

      const result = await shoppingListsDatabase.updateShoppingList(
        testShoppingList._id,
        testShoppingList.user_id,
        updateShoppingList
      );

      expect(result).toEqual({
        ...testShoppingList,
        ...updateShoppingList,
      });
      expect(ShoppingListModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: testShoppingList._id, user_id: testShoppingList.user_id },
        updateShoppingList,
        { new: true }
      );
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      ShoppingListModel.findOneAndUpdate = jest.fn().mockReturnValue(null);

      await expect(
        shoppingListsDatabase.updateShoppingList(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id,
          {}
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));

      expect(ShoppingListModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new mongoose.Types.ObjectId("123456789012345678901234"),
          user_id: testShoppingList.user_id,
        },
        {},
        { new: true }
      );
    });
  });

  describe("deleteShoppingList", () => {
    it("should delete a shopping list", async () => {
      ShoppingListModel.findOneAndDelete = jest
        .fn()
        .mockReturnValue(testShoppingList);

      await shoppingListsDatabase.deleteShoppingList(
        testShoppingList._id,
        testShoppingList.user_id
      );

      const result = await ShoppingListModel.findOne({
        _id: testShoppingList._id,
      });

      expect(result).toBeNull();
      expect(ShoppingListModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: testShoppingList._id,
        user_id: testShoppingList.user_id,
      });
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      ShoppingListModel.findOneAndDelete = jest.fn().mockReturnValue(null);

      await expect(
        shoppingListsDatabase.deleteShoppingList(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));

      expect(ShoppingListModel.findOneAndDelete).toHaveBeenCalledWith({
        _id: new mongoose.Types.ObjectId("123456789012345678901234"),
        user_id: testShoppingList.user_id,
      });
    });
  });
});
