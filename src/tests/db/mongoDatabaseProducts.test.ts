import { UserModel } from "../../database/mongoDatabase.models";
import MongoDatabase from "../../database/mongoDatabase";
import { Product, User } from "../../database/database.types";
import mongoose from "mongoose";

const mongoDatabase = new MongoDatabase();

const mockId = "ffffffffffffffffffffffff";

const mockProduct: Product = {
  _id: new mongoose.Types.ObjectId(mockId),
  name: "test",
  description: "test",
  user_id: new mongoose.Types.ObjectId(mockId),
  items: [],
  ean: "1234567890123",
};

const mockUser: User = {
  _id: new mongoose.Types.ObjectId(mockId),
  email: "test@test.de",
  password: "password",
  name: "test",
};

describe("MongoDatabase Products", () => {});
