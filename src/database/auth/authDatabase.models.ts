import mongoose from "mongoose";
import { AccessToken, User } from "./authDatabase.types";

const userSchema = new mongoose.Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },

  name: { type: String, required: true },

  isVerified: { type: Boolean, required: true },
});

export const UserModel = mongoose.model<User>("User", userSchema);

const accessTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  refresh_token: { type: String, required: true },
});

export const AccessTokenModel = mongoose.model<AccessToken>(
  "AccessToken",
  accessTokenSchema
);
