import mongoose from "mongoose";
import { ShoppingList } from "./shoppingListsDatabase.types";

const shoppingListsDatabase = {
  getShoppingLists: async (
    userId: mongoose.Types.ObjectId
  ): Promise<ShoppingList> => {
    return {} as ShoppingList;
  },
  getShoppingListById: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<ShoppingList[]> => {
    return [] as ShoppingList[];
  },
  createShoppingList: async (
    shoppingList: Omit<ShoppingList, "_id">
  ): Promise<ShoppingList> => {
    return {} as ShoppingList;
  },
  updateShoppingList: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    updateShoppingList: Partial<Omit<ShoppingList, "_id">>
  ): Promise<ShoppingList> => {
    return {} as ShoppingList;
  },
  deleteShoppingList: async (
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<void> => {},
};

export default shoppingListsDatabase;
