import type mongoose from "mongoose";

export interface Item {
  expiration_date: Date;
}
export interface Product {
  ean: string;
  user_id: mongoose.Types.ObjectId;

  name: string;
  description: string;

  items: Item[];
}
