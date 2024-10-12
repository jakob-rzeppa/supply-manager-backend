import "jsr:@std/dotenv/load";

import Database from "./database.ts";
import type {
  Product,
  ProductUpdateObject,
  User,
  UserUpdateObject,
} from "./database.types.ts";
import mongoose from "mongoose";
import NotFoundException from "../errors/notFoundException.ts";
import { ProductModel, UserModel } from "./database.models.ts";

export default class MongoDatabase extends Database {
  public async connect(test_db: boolean): Promise<void> {
    if (mongoose.connection.readyState !== mongoose.STATES.disconnected) {
      console.log("Mongoose status: ", mongoose.connection.readyState);
      return;
    }

    const mongoURI = test_db
      ? Deno.env.get("MONGO_TEST_URI")
      : Deno.env.get("MONGO_URI");
    if (!mongoURI) throw new Error("MONGO_URI must be provided");

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB");
  }

  // ---- user ----
  public async getUserById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  public async createUser(user: User): Promise<User> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  public async updateUser(
    id: string,
    updateUserObject: UserUpdateObject
  ): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundException("User not found");

    Object.keys(updateUserObject).forEach((key) => {
      const typedKey = key as keyof UserUpdateObject;
      if (updateUserObject[typedKey] !== undefined) {
        user[typedKey] = updateUserObject[typedKey];
      }
    });

    return await user.save();
  }

  //TODO: delete all items and products related to user
  public async deleteUser(id: string): Promise<void> {
    const deleteResponse = await UserModel.deleteOne({ _id: id });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundException("User not found");
    }
  }

  // ---- product ----
  public async getProductsByUserId(userId: string): Promise<Product[]> {
    return await ProductModel.find({ user_id: userId });
  }
  public async getProductById(id: string): Promise<Product> {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }
  public async getProductByEanAndUser(
    ean: string,
    userId: string
  ): Promise<Product> {
    const product = await ProductModel.findOne({ ean, user_id: userId });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  //TODO: check if ean is unique for user
  public async createProduct(product: Product): Promise<Product> {
    const newProduct = new ProductModel(product);
    return await newProduct.save();
  }

  //TODO: check if ean is unique for user
  public async updateProduct(
    id: string,
    updateProductObject: ProductUpdateObject
  ): Promise<Product> {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundException("Product not found");

    Object.keys(updateProductObject).forEach((key) => {
      const typedKey = key as keyof ProductUpdateObject;
      if (updateProductObject[typedKey] !== undefined) {
        product[typedKey] = updateProductObject[typedKey];
      }
    });

    return await product.save();
  }

  //TODO: delete all items related to product
  public async deleteProductById(id: string): Promise<void> {
    const deleteResponse = await ProductModel.deleteOne({
      _id: id,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundException("Product not found");
    }
  }
  public async deleteProductByEanAndUser(
    ean: string,
    userId: string
  ): Promise<void> {
    const deleteResponse = await ProductModel.deleteOne({
      ean,
      user_id: userId,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundException("Product not found");
    }
  }
}
