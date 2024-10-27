import mongoose from "mongoose";

export interface User {
  _id: mongoose.Types.ObjectId;

  email: string;
  password: string;

  name: string;

  isVerified: boolean;
}

export interface AccessToken {
  user_id: mongoose.Types.ObjectId;
  token: string;
}
