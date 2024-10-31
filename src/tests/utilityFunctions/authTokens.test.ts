import { generateAccessToken } from "../../utilityFunctions/authTokens";
import jwt from "jsonwebtoken";
import authDatabase from "../../database/auth/authDatabase";
import UserDto from "../../dtos/user.dto";
import { env } from "../../config/env";
import mongoose from "mongoose";

jest.mock("jsonwebtoken");
jest.mock("../../database/auth/authDatabase");

describe("generateAccessToken", () => {
  const user: Omit<UserDto, "password"> = {
    id: "ffffffffffffffffffffffff",
    email: "test@example.com",
    name: "Test User",
  };

  const accessToken = "mockAccessToken";

  beforeEach(() => {
    (jwt.sign as jest.Mock).mockReturnValue(accessToken);
    (authDatabase.createAccessToken as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should generate an access token and store it in the database", async () => {
    const result = await generateAccessToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(user, env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
    expect(authDatabase.createAccessToken).toHaveBeenCalledWith({
      token: accessToken,
      user_id: new mongoose.Types.ObjectId(user.id),
    });
    expect(result).toBe(accessToken);
  });

  it("should throw an error if storing the access token fails", async () => {
    const error = new Error("Database error");
    (authDatabase.createAccessToken as jest.Mock).mockRejectedValue(error);

    await expect(generateAccessToken(user)).rejects.toThrow(error);
  });
});
