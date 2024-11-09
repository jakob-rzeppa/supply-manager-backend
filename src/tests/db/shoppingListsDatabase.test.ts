import mongoose from "mongoose";
import { Product } from "../../database/product/productDatabase.types";
import { ShoppingList } from "../../database/shoppingLists/shoppingListsDatabase.types";
import { ShoppingListModel } from "../../database/shoppingLists/shoppingListsDatabase.models";
import shoppingListsDatabase from "../../database/shoppingLists/shoppingListsDatabase";
import NotFoundError from "../../errors/db/notFoundError";
import ResourceAlreadyExistsError from "../../errors/db/resourceAlreadyExistsError";

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

describe("Shopping Lists Database", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getShoppingLists", () => {
    it("should return shopping lists", async () => {
      const result = await shoppingListsDatabase.getShoppingLists(
        testShoppingList.user_id
      );

      expect(result).toEqual([testShoppingList]);
    });
  });

  describe("getShoppingListById", () => {
    it("should return a shopping list", async () => {
      const result = await shoppingListsDatabase.getShoppingListById(
        testShoppingList._id,
        testShoppingList.user_id
      );

      expect(result).toEqual(testShoppingList);
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      await expect(
        shoppingListsDatabase.getShoppingListById(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));
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

      const result = await shoppingListsDatabase.createShoppingList(
        newShoppingList
      );

      expect(result).toEqual({
        _id: expect.any(mongoose.Types.ObjectId),
        ...newShoppingList,
      });
    });

    it("should throw an error if the shopping list already exists", async () => {
      await expect(
        shoppingListsDatabase.createShoppingList(testShoppingList)
      ).rejects.toThrow(
        new ResourceAlreadyExistsError("Shopping list already exists")
      );
    });
  });

  describe("updateShoppingList", () => {
    it("should update a shopping list", async () => {
      const updateShoppingList = {
        name: "Updated Shopping List",
        description: "Updated Description",
        products: [],
      };

      const result = await shoppingListsDatabase.updateShoppingList(
        testShoppingList._id,
        testShoppingList.user_id,
        updateShoppingList
      );

      expect(result).toEqual({
        ...testShoppingList,
        ...updateShoppingList,
      });
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      await expect(
        shoppingListsDatabase.updateShoppingList(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id,
          {}
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));
    });
  });

  describe("deleteShoppingList", () => {
    it("should delete a shopping list", async () => {
      await shoppingListsDatabase.deleteShoppingList(
        testShoppingList._id,
        testShoppingList.user_id
      );

      const result = await ShoppingListModel.findOne({
        _id: testShoppingList._id,
      });

      expect(result).toBeNull();
    });

    it("should throw an NotFoundError if the shopping list does not exist", async () => {
      await expect(
        shoppingListsDatabase.deleteShoppingList(
          new mongoose.Types.ObjectId("123456789012345678901234"),
          testShoppingList.user_id
        )
      ).rejects.toThrow(new NotFoundError("Shopping list not found"));
    });
  });
});
