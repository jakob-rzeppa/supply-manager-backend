import bcrypt from "bcrypt";

import authDatabase from "../database/auth/authDatabase";
import AuthorisationError from "../errors/auth/authorisationError";
import { generateAccessToken } from "../utilityFunctions/authTokens";
import { catchPromiseError } from "../utilityFunctions/errorHandling";

export default {
  login: async (email: string, password: string) => {
    const [userError, user] = await catchPromiseError(
      authDatabase.getUserByEmail(email)
    );
    if (userError) throw userError;

    if (!(await bcrypt.compare(password, user.password)))
      throw new AuthorisationError("Invalid password");

    const [tokenCreationError, accessToken] = await catchPromiseError(
      generateAccessToken({
        email: user.email,
        name: user.name,
        id: user._id.toString(),
      })
    );
    if (tokenCreationError) throw tokenCreationError;

    const [error] = await catchPromiseError(
      authDatabase.createAccessToken({
        token: accessToken,
        user_id: user._id,
      })
    );
    if (error) throw error;

    return accessToken;
  },

  logout: async (token: string) => {
    const [error] = await catchPromiseError(
      authDatabase.deleteAccessToken(token)
    );
    if (error) throw error;
  },
};
