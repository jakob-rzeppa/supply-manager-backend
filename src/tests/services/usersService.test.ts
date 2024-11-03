import usersService from "../../services/usersService";
import authDatabase from "../../database/auth/authDatabase";
import { generateAccessToken } from "../../utilityFunctions/authTokens";
import bcrypt from "bcrypt";

jest.mock("../../database/auth/authDatabase");
jest.mock("../../utilityFunctions/authTokens");
jest.mock("bcrypt");

describe("usersService", () => {
  describe("createUser", () => {
    it("should create a new user and return an access token", async () => {
      const name = "John Doe";
      const email = "john.doe@example.com";
      const password = "password123";
      const hashedPassword = "hashedPassword123";
      const user = { _id: "1", name, email, isVerified: false };
      const accessToken = "accessToken123";

      (authDatabase.isUserExisting as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (authDatabase.createUser as jest.Mock).mockResolvedValue(user);
      (generateAccessToken as jest.Mock).mockResolvedValue(accessToken);

      const result = await usersService.createUser(name, email, password);

      expect(authDatabase.isUserExisting).toHaveBeenCalledWith({ email, name });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(authDatabase.createUser).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
        name,
        isVerified: false,
      });
      expect(generateAccessToken).toHaveBeenCalledWith({
        name: user.name,
        id: user._id.toString(),
        email: user.email,
      });
      expect(result).toBe(accessToken);
    });

    it("should throw an error if user already exists", async () => {
      const name = "John Doe";
      const email = "john.doe@example.com";
      const password = "password123";
      const userExistsError = new Error("User already exists");

      (authDatabase.isUserExisting as jest.Mock).mockResolvedValue(
        userExistsError
      );

      await expect(
        usersService.createUser(name, email, password)
      ).rejects.toThrow(userExistsError);
    });
  });

  describe("updateUser", () => {
    it("should update an existing user and return the updated user", async () => {
      const id = "1";
      const body = { name: "John Doe Updated" };
      const updatedUser = { _id: id, ...body };

      (authDatabase.updateUser as jest.Mock).mockResolvedValue(updatedUser);

      const result = await usersService.updateUser(id, body);

      expect(authDatabase.updateUser).toHaveBeenCalledWith(id, body);
      expect(result).toBe(undefined);
    });

    it("should throw an error if update fails", async () => {
      const id = "1";
      const body = { name: "John Doe Updated" };
      const updateError = new Error("Update failed");

      (authDatabase.updateUser as jest.Mock).mockRejectedValue(updateError);

      await expect(usersService.updateUser(id, body)).rejects.toThrow(
        updateError
      );
    });
  });
});
