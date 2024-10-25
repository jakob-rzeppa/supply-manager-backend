import {
  RefreshTokenModel,
  UserModel,
} from "../../database/auth/authDatabase.models";
import { User } from "../../database/auth/authDatabase.types";
import mongoose from "mongoose";
import authDatabase from "../../database/auth/authDatabase";

const mockId = "ffffffffffffffffffffffff";

const mockUser: User = {
  _id: new mongoose.Types.ObjectId(mockId),
  email: "test@test.de",
  password: "password",
  name: "test",
};

describe("authDatabase", () => {
  describe("getUserById", () => {
    it("should call UserModel.findById with the correct id and return a user", async () => {
      const mock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(mockUser);
      const user = await authDatabase.getUserById(mockId);

      expect(user).toEqual(mockUser);
      expect(mock).toHaveBeenCalledWith(mockId);
    });

    it("should throw a NotFoundError if UserModel.findById returns null", async () => {
      const mock = jest
        .spyOn(UserModel, "findById")
        .mockResolvedValueOnce(null);

      await expect(authDatabase.getUserById(mockId)).rejects.toThrow(
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

      const user = await authDatabase.createUser(mockUser);

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
      const updatedUser = await authDatabase.updateUser(
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

      await expect(authDatabase.updateUser(mockId, {})).rejects.toThrow(
        "User not found"
      );
      expect(mock).toHaveBeenCalledWith(mockId);
    });
  });

  describe("deleteUser", () => {
    it("should call UserModel.deleteOne with the correct id and delete the user", async () => {
      const deleteOneMock = jest
        .spyOn(UserModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);
      const deleteManyMock = jest
        .spyOn(RefreshTokenModel, "deleteMany")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);

      await authDatabase.deleteUser(mockId);

      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockId });
      expect(deleteManyMock).toHaveBeenCalledWith({ user_id: mockId });
    });

    it("should throw a NotFoundError if UserModel.deleteOne returns 0", async () => {
      const mock = jest
        .spyOn(UserModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 0 } as any);

      await expect(authDatabase.deleteUser(mockId)).rejects.toThrow(
        "User not found"
      );
      expect(mock).toHaveBeenCalledWith({ _id: mockId });
    });
  });

  describe("getRefreshTokens", () => {
    it("should call RefreshTokenModel.find and return all refresh tokens", async () => {
      const mockRefreshTokens = [
        { _id: "1", user_id: "1", token: "token1" },
        { _id: "2", user_id: "2", token: "token2" },
      ];
      const mock = jest
        .spyOn(RefreshTokenModel, "find")
        .mockResolvedValueOnce(mockRefreshTokens);

      const refreshTokens = await authDatabase.getRefreshTokens();

      expect(refreshTokens).toEqual(mockRefreshTokens);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe("createRefreshToken", () => {
    it("should create a new refresh token and return it", async () => {
      const mockRefreshToken = {
        _id: "1",
        user_id: "1",
        token: "token",
      };
      const mock = jest
        .spyOn(RefreshTokenModel.prototype, "save")
        .mockResolvedValueOnce(mockRefreshToken);

      const refreshToken = await authDatabase.createRefreshToken({
        user_id: new mongoose.Types.ObjectId("ffffffffffffffffffffffff"),
        refresh_token: "token",
      });

      expect(refreshToken).toEqual(mockRefreshToken);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe("deleteRefreshToken", () => {
    it("should call RefreshTokenModel.deleteOne with the correct id and delete the refresh token", async () => {
      const deleteOneMock = jest
        .spyOn(RefreshTokenModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);

      await authDatabase.deleteRefreshToken(mockId);

      expect(deleteOneMock).toHaveBeenCalledWith({ _id: mockId });
    });
  });
});
