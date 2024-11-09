import mongoose from "mongoose";
import { ShoppingList } from "./shoppingListsDatabase.types";
import { ShoppingListModel } from "./shoppingListsDatabase.models";
import NotFoundError from "../../errors/db/notFoundError";

const shoppingListsDatabase = {
  getShoppingLists: async (
    userId: mongoose.Types.ObjectId
  ): Promise<ShoppingList[]> => {
    const shoppingLists = await ShoppingListModel.find({ user_id: userId });

    return shoppingLists as ShoppingList[];
  },
  getShoppingListById: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<ShoppingList> => {
    const shoppingList = await ShoppingListModel.findOne({
      _id: id,
      user_id: userId,
    });

    if (!shoppingList) {
      throw new NotFoundError("Shopping list not found");
    }

    return shoppingList as ShoppingList;
  },
  createShoppingList: async (
    shoppingList: Omit<ShoppingList, "_id">
  ): Promise<ShoppingList> => {
    const newShoppingList = new ShoppingListModel(shoppingList);

    const createdShoppingList = await newShoppingList.save();

    return createdShoppingList as ShoppingList;
  },
  updateShoppingList: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    updateShoppingList: Partial<Omit<ShoppingList, "_id">>
  ): Promise<ShoppingList> => {
    const shoppingList = await ShoppingListModel.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateShoppingList,
      { new: true }
    );

    if (!shoppingList) {
      throw new NotFoundError("Shopping list not found");
    }

    return shoppingList as ShoppingList;
  },
  deleteShoppingList: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> => {
    const shoppingList = await ShoppingListModel.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!shoppingList) {
      throw new NotFoundError("Shopping list not found");
    }
  },
};

export default shoppingListsDatabase;
