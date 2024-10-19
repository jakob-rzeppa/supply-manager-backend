import mongoose from "mongoose";
import type { Product, User, Item } from "./database.types";

const itemSchema = new mongoose.Schema<Item>({
  expiration_date: { type: Date, required: false },
});

const productSchema = new mongoose.Schema<Product>({
  ean: { type: String, required: false },
  user_id: mongoose.Schema.Types.ObjectId,

  name: { type: String, required: true },
  description: { type: String, required: false },

  items: [itemSchema],
});

export const ProductModel = mongoose.model<Product>("Product", productSchema);

const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },

  name: { type: String, required: true },
});

export const UserModel = mongoose.model<User>("User", userSchema);
