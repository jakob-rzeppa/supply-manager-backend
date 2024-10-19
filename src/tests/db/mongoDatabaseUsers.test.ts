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
      const mock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(mockUser);
      const user = await mongoDatabase.getUserById(mockId);

      expect(user).toEqual(mockUser);
      expect(mock).toHaveBeenCalledWith(mockId);
    });

    it("should throw a NotFoundError if UserModel.findById returns null", async () => {
      const mock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(null);

      await expect(mongoDatabase.getUserById(mockId)).rejects.toThrow(
        "User not found"
      );
      expect(mock).toHaveBeenCalledWith(mockId);
    });
  });

  describe("createUser", () => {
    it("should create a new user and return it", async () => {
      const mock = jest
        .spyOn(UserModel.prototype, "save")
        .mockResolvedValueOnce(mockUser);

      const user = await mongoDatabase.createUser(mockUser);

      expect(user).toEqual(mockUser);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should call UserModel.findById with the correct id and update the user", async () => {
      const mockUpdatedUser = { ...mockUser, email: "newEmail" };
      let user = new UserModel(mockUser);

      const findByIdMock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(user);
      const saveMock = jest
        .spyOn(UserModel.prototype, "save")
        .mockResolvedValueOnce(mockUpdatedUser);

      const updateUserObject = { email: "newEmail" };
      const updatedUser = await mongoDatabase.updateUser(
        mockId,
        updateUserObject
      );

      expect(updatedUser).toEqual(mockUpdatedUser);
      expect(findByIdMock).toHaveBeenCalledWith(mockId);
      expect(user).toEqual(new UserModel(updatedUser));
      expect(saveMock).toHaveBeenCalled();
    });

    it("should throw a NotFoundError if UserModel.findById returns null", async () => {
      const mock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(null);

      await expect(mongoDatabase.updateUser(mockId, {})).rejects.toThrow(
        "User not found"
      );
      expect(mock).toHaveBeenCalledWith(mockId);
    });
  });

  describe("deleteUser", () => {
    it("should call UserModel.deleteOne with the correct id", async () => {
      const mock = jest
        .spyOn(UserModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);

      await mongoDatabase.deleteUser(mockId);

      expect(mock).toHaveBeenCalledWith({ _id: mockId });
    });

    it("should throw a NotFoundError if UserModel.deleteOne returns 0", async () => {
      const mock = jest
        .spyOn(UserModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 0 } as any);

      await expect(mongoDatabase.deleteUser(mockId)).rejects.toThrow(
        "User not found"
      );
      expect(mock).toHaveBeenCalledWith({ _id: mockId });
    });
  });
});