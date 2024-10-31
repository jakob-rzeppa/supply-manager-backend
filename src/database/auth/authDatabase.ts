import NotFoundError from "../../errors/db/notFoundError";
import { AccessToken, User } from "./authDatabase.types";
import { AccessTokenModel, UserModel } from "./authDatabase.models";
import ResourceAlreadyExistsError from "../../errors/db/resourceAlreadyExistsError";

const authDatabase = {
  isUserExisting: async (user: {
    email: string | undefined;
    name: string | undefined;
  }) => {
    if (user.email) {
      const emailExists = await UserModel.exists({
        email: user.email,
      });

      if (emailExists)
        return new ResourceAlreadyExistsError("Email already exists");
    }
    if (user.name) {
      const nameExists = await UserModel.exists({
        email: user.email,
      });
      if (nameExists)
        return new ResourceAlreadyExistsError("Username already exists");
    }
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  getUserById: async (id: string): Promise<User> => {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  createUser: async (user: Omit<User, "_id">): Promise<User> => {
    const newUser = new UserModel(user);
    return await newUser.save();
  },

  updateUser: async (
    id: string,
    updateUserObject: Partial<Omit<User, "_id">>
  ): Promise<User> => {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");

    const isExistingError = await authDatabase.isUserExisting({
      email: updateUserObject.email,
      name: updateUserObject.name,
    });
    if (isExistingError !== undefined) throw isExistingError;

    user.email = updateUserObject.email || user.email;
    user.name = updateUserObject.name || user.name;
    user.password = updateUserObject.password || user.password;
    user.isVerified = updateUserObject.isVerified || user.isVerified;

    return await user.save();
  },

  deleteUser: async (id: string): Promise<void> => {
    const deleteResponse = await UserModel.deleteOne({ _id: id });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("User not found");
    }

    // delete all refresh tokens related to user
    await AccessTokenModel.deleteMany({ user_id: id });
  },

  getAccessTokens: async (): Promise<AccessToken[]> => {
    return await AccessTokenModel.find();
  },

  createAccessToken: async (
    AccessToken: Omit<AccessToken, "_id">
  ): Promise<AccessToken> => {
    const newAccessToken = new AccessTokenModel(AccessToken);
    return await newAccessToken.save();
  },

  deleteAccessToken: async (token: string): Promise<void> => {
    const deleteResponse = await AccessTokenModel.deleteOne({ token });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Access token not found");
    }
  },
};

export default authDatabase;
