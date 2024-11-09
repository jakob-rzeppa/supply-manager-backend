import mongoose from "mongoose";
import { ShoppingList } from "./shoppingListsDatabase.types";

const shoppingListSchema = new mongoose.Schema<ShoppingList>({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  description: { type: String, required: false },

  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      amount: { type: Number, required: true },
    },
  ],
});

export const ShoppingListModel = mongoose.model<ShoppingList>(
  "ShoppingList",
  shoppingListSchema
);
