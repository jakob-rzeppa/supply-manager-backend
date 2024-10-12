import mongoose from "npm:mongoose";
import type { Product, User, Item } from "./database.types.ts";

const itemSchema = new mongoose.Schema<Item>({
  expiration_date: { type: Date, required: false },
});

const productSchema = new mongoose.Schema<Product>({
  ean: { type: String, required: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  name: { type: String, required: true },
  description: { type: String, required: false },

  items: { type: [itemSchema], required: true, default: [] },
});

export const ProductModel = mongoose.model<Product>("Product", productSchema);

const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },

  name: { type: String, required: true },
});

export const UserModel = mongoose.model<User>("User", userSchema);
