import { UserModel } from "../../database/mongoDatabase.models";
import MongoDatabase from "../../database/mongoDatabase";
import { User } from "../../database/database.types";
import mongoose from "mongoose";

const mongoDatabase = new MongoDatabase();

const mockId = "ffffffffffffffffffffffff";

const mockUser: User = {
  _id: new mongoose.Types.ObjectId(mockId),
  email: "test@test.de",
  password: "password",
  name: "test",
};

describe("MongoDatabase Users", () => {
  describe("getUserById", () => {
    it("should call UserModel.findById with the correct id and return a user", async () => {
      UserModel.findById = jest.fn().mockReturnValue(mockUser);
      const user = await mongoDatabase.getUserById(mockId);

      expect(user).toEqual(mockUser);
      expect(UserModel.findById).toHaveBeenCalledWith(mockId);
    });

    it("should throw a NotFoundError if UserModel.findById returns null", async () => {
      UserModel.findById = jest.fn().mockReturnValue(null);

      await expect(mongoDatabase.getUserById(mockId)).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("createUser", () => {
    it("should create a new user and return it", async () => {
      UserModel.prototype.save = jest.fn().mockReturnValue(mockUser);

      const user = await mongoDatabase.createUser(mockUser);

      expect(user).toEqual(mockUser);
      expect(UserModel.prototype.save).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should call UserModel.findById with the correct id and update the user", async () => {
      const mockUpdatedUser = { ...mockUser, email: "newEmail" };
      let user = new UserModel(mockUser);

      UserModel.findById = jest.fn().mockReturnValue(user);
      UserModel.prototype.save = jest.fn().mockReturnValue(mockUpdatedUser);

      const updateUserObject = { email: "newEmail" };
      const updatedUser = await mongoDatabase.updateUser(
        mockId,
        updateUserObject
      );

      expect(updatedUser).toEqual(mockUpdatedUser);
      expect(UserModel.findById).toHaveBeenCalledWith(mockId);
      expect(user).toEqual(new UserModel(updatedUser));
      expect(UserModel.prototype.save).toHaveBeenCalled();
    });

    it("should throw a NotFoundError if UserModel.findById returns null", async () => {
      UserModel.findById = jest.fn().mockReturnValue(null);

      await expect(mongoDatabase.updateUser(mockId, {})).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("deleteUser", () => {
    it("should call UserModel.deleteOne with the correct id", async () => {
      UserModel.deleteOne = jest.fn().mockReturnValue({ deletedCount: 1 });

      await mongoDatabase.deleteUser(mockId);

      expect(UserModel.deleteOne).toHaveBeenCalledWith({ _id: mockId });
    });

    it("should throw a NotFoundError if UserModel.deleteOne returns 0", async () => {
      UserModel.deleteOne = jest.fn().mockReturnValue({ deletedCount: 0 });

      await expect(mongoDatabase.deleteUser(mockId)).rejects.toThrow(
        "User not found"
      );
    });
  });
});
