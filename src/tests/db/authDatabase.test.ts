import {
  AccessTokenModel,
  UserModel,
} from "../../database/auth/authDatabase.models";
import { User } from "../../database/auth/authDatabase.types";
import mongoose from "mongoose";
import authDatabase from "../../database/auth/authDatabase";
import NotFoundError from "../../errors/db/notFoundError";
import ResourceAlreadyExistsError from "../../errors/db/resourceAlreadyExistsError";

const mockId = "ffffffffffffffffffffffff";

const mockUser: User = {
  _id: new mongoose.Types.ObjectId(mockId),
  email: "test@test.de",
  password: "password",
  name: "test",
  isVerified: false,
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

  describe("deleteUser", () => {
    it("should call UserModel.deleteOne with the correct id and delete the user", async () => {
      const deleteOneMock = jest
        .spyOn(UserModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);
      const deleteManyMock = jest
        .spyOn(AccessTokenModel, "deleteMany")
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

  describe("getAccessTokens", () => {
    it("should call AccessTokenModel.find and return all access tokens", async () => {
      const mockAccessTokens = [
        { _id: "1", user_id: "1", token: "token1" },
        { _id: "2", user_id: "2", token: "token2" },
      ];
      const mock = jest
        .spyOn(AccessTokenModel, "find")
        .mockResolvedValueOnce(mockAccessTokens);

      const accessTokens = await authDatabase.getAccessTokens();

      expect(accessTokens).toEqual(mockAccessTokens);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe("createAccessToken", () => {
    it("should create a new access token and return it", async () => {
      const mockAccessToken = {
        _id: "1",
        user_id: "1",
        token: "token",
      };
      const mock = jest
        .spyOn(AccessTokenModel.prototype, "save")
        .mockResolvedValueOnce(mockAccessToken);

      const accessToken = await authDatabase.createAccessToken({
        user_id: new mongoose.Types.ObjectId("ffffffffffffffffffffffff"),
        token: "token",
      });

      expect(accessToken).toEqual(mockAccessToken);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe("deleteAccessToken", () => {
    it("should call AccessTokenModel.deleteOne with the correct id and delete the access token", async () => {
      const deleteOneMock = jest
        .spyOn(AccessTokenModel, "deleteOne")
        .mockResolvedValueOnce({ deletedCount: 1 } as any);

      await authDatabase.deleteAccessToken("token");

      expect(deleteOneMock).toHaveBeenCalledWith({ token: "token" });
    });
  });
});
