import NotFoundError from "../errors/db/notFoundError";
import { User } from "./database.types";
import { UserModel } from "./database.models";

const userDatabase = {
  getById: async (id: string): Promise<User> => {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  create: async (user: User): Promise<User> => {
    const newUser = new UserModel(user);
    return await newUser.save();
  },

  update: async (
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

  //TODO: delete all items and products related to user
  delete: async (id: string): Promise<void> => {
    const deleteResponse = await UserModel.deleteOne({ _id: id });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("User not found");
    }
  },
};

export default userDatabase;
