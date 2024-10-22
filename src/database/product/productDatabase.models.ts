import mongoose from "mongoose";
import type { Product, Item } from "./productDatabase.types";

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
