import bcrypt from "bcrypt";

import { catchPromiseError } from "../utilityFunctions/errorHandling";
import authDatabase from "../database/auth/authDatabase";
import { generateAccessToken } from "../utilityFunctions/authTokens";
import UserDto from "../dtos/user.dto";

export default {
  createUser: async (name: string, email: string, password: string) => {
    // Check if user already exists
    const userExistsError = await authDatabase.isUserExisting({ email, name });
    if (userExistsError) throw userExistsError;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userError, user] = await catchPromiseError(
      authDatabase.createUser({
        email,
        password: hashedPassword,
        name,
        isVerified: false,
      })
    );
    if (userError) throw userError;

    // TODO Send email to verify user

    const [tokenError, accessToken] = await catchPromiseError(
      generateAccessToken({
        name: user.name,
        id: user._id.toString(),
        email: user.email,
      })
    );
    if (tokenError) throw tokenError;

    return accessToken;
  },

  updateUser: async (
    id: string,
    body: Partial<Omit<UserDto, "password" | "id">>
  ) => {
    const [userError, user] = await catchPromiseError(
      authDatabase.updateUser(id, body)
    );
    if (userError) throw userError;

    return user;
  },
};
