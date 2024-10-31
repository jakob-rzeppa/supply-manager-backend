import authService from "../../services/authService";
import authDatabase from "../../database/auth/authDatabase";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../../utilityFunctions/authTokens";
import AuthorisationError from "../../errors/auth/authorisationError";
import { catchPromiseError } from "../../utilityFunctions/errorHandling";

jest.mock("../../database/auth/authDatabase");
jest.mock("bcrypt");
jest.mock("../../utilityFunctions/authTokens");
jest.mock("../../utilityFunctions/errorHandling");

describe("authService", () => {
  describe("login", () => {
    it("should return an access token for valid credentials", async () => {
      const email = "test@example.com";
      const password = "password123";
      const user = {
        email,
        password: "hashedPassword",
        name: "Test User",
        _id: "userId",
      };
      const accessToken = "accessToken";

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        user,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        accessToken,
      ]);
      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        null,
      ]);

      const result = await authService.login(email, password);

      expect(result).toBe(accessToken);
      expect(authDatabase.getUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(generateAccessToken).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        id: user._id.toString(),
      });
      expect(authDatabase.createAccessToken).toHaveBeenCalledWith({
        token: accessToken,
        user_id: user._id,
      });
    });

    it("should throw an error if user is not found", async () => {
      const email = "test@example.com";
      const password = "password123";

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        new Error("User not found"),
        null,
      ]);

      await expect(authService.login(email, password)).rejects.toThrow(
        "User not found"
      );
    });

    it("should throw an error if password is invalid", async () => {
      const email = "test@example.com";
      const password = "password123";
      const user = {
        email,
        password: "hashedPassword",
        name: "Test User",
        _id: "userId",
      };

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        user,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        AuthorisationError
      );
    });

    it("should throw an error if token creation fails", async () => {
      const email = "test@example.com";
      const password = "password123";
      const user = {
        email,
        password: "hashedPassword",
        name: "Test User",
        _id: "userId",
      };

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        user,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        new Error("Token creation failed"),
        null,
      ]);

      await expect(authService.login(email, password)).rejects.toThrow(
        "Token creation failed"
      );
    });
  });

  describe("logout", () => {
    it("should delete the access token", async () => {
      const token = "accessToken";

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        null,
        null,
      ]);

      await authService.logout(token);

      expect(authDatabase.deleteAccessToken).toHaveBeenCalledWith(token);
    });

    it("should throw an error if token deletion fails", async () => {
      const token = "accessToken";

      (catchPromiseError as jest.Mock).mockImplementationOnce(() => [
        new Error("Token deletion failed"),
        null,
      ]);

      await expect(authService.logout(token)).rejects.toThrow(
        "Token deletion failed"
      );
    });
  });
});
