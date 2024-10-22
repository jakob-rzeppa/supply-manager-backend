import mongoose from "mongoose";

export interface User {
  _id: mongoose.Types.ObjectId;

  email: string;
  password: string;

  name: string;
}

export interface RefreshToken {
  _id: mongoose.Types.ObjectId;

  user_id: mongoose.Types.ObjectId;
  refresh_token: string;
}
