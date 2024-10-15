import type mongoose from "mongoose";

export interface Item {
  _id: mongoose.Types.ObjectId;

  expiration_date: Date;
}
export interface Product {
  _id: mongoose.Types.ObjectId;

  ean: string;
  user_id: mongoose.Types.ObjectId;

  name: string;
  description: string;

  items: Item[];
}

export interface User {
  _id: mongoose.Types.ObjectId;

  email: string;
  password: string;

  name: string;
}
