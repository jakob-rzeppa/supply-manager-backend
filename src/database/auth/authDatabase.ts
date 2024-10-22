import NotFoundError from "../../errors/db/notFoundError";
import { RefreshToken, User } from "./authDatabase.types";
import { RefreshTokenModel, UserModel } from "./authDatabase.models";

const authDatabase = {
  getUserById: async (id: string): Promise<User> => {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  createUser: async (user: User): Promise<User> => {
    const newUser = new UserModel(user);
    return await newUser.save();
  },

  updateUser: async (
    id: string,
    updateUserObject: Partial<Omit<User, "_id">>
  ): Promise<User> => {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");

    Object.keys(updateUserObject).forEach((key) => {
      const typedKey = key as keyof typeof updateUserObject;
      if (updateUserObject[typedKey] !== undefined) {
        user[typedKey] = updateUserObject[typedKey];
      }
    });

    return await user.save();
  },

  deleteUser: async (id: string): Promise<void> => {
    const deleteResponse = await UserModel.deleteOne({ _id: id });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("User not found");
    }

    // delete all refresh tokens related to user
    await RefreshTokenModel.deleteMany({ user_id: id });
  },

  getRefreshTokens: async (): Promise<RefreshToken[]> => {
    return await RefreshTokenModel.find();
  },

  createRefreshToken: async (
    refreshToken: Omit<RefreshToken, "_id">
  ): Promise<RefreshToken> => {
    const newRefreshToken = new RefreshTokenModel(refreshToken);
    return await newRefreshToken.save();
  },

  deleteRefreshToken: async (id: string): Promise<void> => {
    const deleteResponse = await RefreshTokenModel.deleteOne({ _id: id });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Refresh token not found");
    }
  },
};

export default authDatabase;
