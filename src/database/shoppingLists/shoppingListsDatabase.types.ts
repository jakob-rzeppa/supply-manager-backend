import mongoose from "mongoose";
import { Product } from "../product/productDatabase.types";

export interface ShoppingList {
  _id: mongoose.Types.ObjectId;

  user_id: mongoose.Types.ObjectId;

  name: string;
  description: string;

  products: { product: Product; amount: number }[];
}
