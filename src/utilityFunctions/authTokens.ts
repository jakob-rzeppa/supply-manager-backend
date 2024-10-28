import jwt from "jsonwebtoken";
import { env } from "../config/env";
import UserDto from "../dtos/user.dto";
import authDatabase from "../database/auth/authDatabase";
import { catchPromiseError } from "./errorHandling";
import mongoose from "mongoose";

export async function generateAccessToken(
  user: Omit<UserDto, "password">
): Promise<string> {
  const accessToken = jwt.sign(user, env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "30m",
  });

  const [accessTokenError] = await catchPromiseError(
    authDatabase.createAccessToken({
      token: accessToken,
      user_id: new mongoose.Types.ObjectId(user.id),
    })
  );
  if (accessTokenError) throw accessTokenError;

  return accessToken;
}
