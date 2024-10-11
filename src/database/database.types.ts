import type mongoose from "mongoose";

export interface Item {
  _id?: mongoose.Schema.Types.ObjectId;

  expiration_date: Date;
}

export interface ItemUpdateObject {
  expiration_date?: Date;
}

export interface Product {
  _id?: mongoose.Schema.Types.ObjectId;

  ean: string;
  user_id: mongoose.Schema.Types.ObjectId;

  name: string;
  description: string;

  items: Item[];
}

export interface ProductUpdateObject {
  ean?: string;

  name?: string;
  description?: string;
}

export interface User {
  _id?: mongoose.Schema.Types.ObjectId;

  email: string;
  password: string;

  name: string;
}

export interface UserUpdateObject {
  email?: string;
  password?: string;

  name?: string;
}
