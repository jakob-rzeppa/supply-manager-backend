import mongoose from "mongoose";
import { RefreshToken, User } from "./authDatabase.types";

const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },

  name: { type: String, required: true },
});

export const UserModel = mongoose.model<User>("User", userSchema);

const refreshTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  refresh_token: { type: String, required: true },
});

export const RefreshTokenModel = mongoose.model<RefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
