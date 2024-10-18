import Database from "./database";
import type { Product, User } from "./database.types";
import mongoose from "mongoose";
import NotFoundError from "../errors/db/notFoundError";
import { ProductModel, UserModel } from "./mongoDatabase.models";
import ResourceAlreadyExistsError from "../errors/db/resourceAlreadyExistsError";

export default class MongoDatabase extends Database {
  public async connect(): Promise<void> {
    if (mongoose.connection.readyState !== mongoose.STATES.disconnected) {
      console.log("Mongoose status: ", mongoose.connection.readyState);
      return;
    }

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error("MONGO_URI must be provided");

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB");
  }

  // ---- user ----
  public async getUserById(id: string): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  public async createUser(user: User): Promise<User> {
    const newUser = new UserModel(user);
    return await newUser.save();
  }

  public async updateUser(
    id: string,
    updateUserObject: Partial<Omit<User, "_id">>
  ): Promise<User> {
    const user = await UserModel.findById(id);
    if (!user) throw new NotFoundError("User not found");

    Object.keys(updateUserObject).forEach((key) => {
      const typedKey = key as keyof typeof updateUserObject;
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
      throw new NotFoundError("User not found");
    }
  }

  // ---- product ----
  public async checkIfEanAlreadyExistsForUser(userId: string, ean: string) {
    const product = await ProductModel.findOne({ user_id: userId, ean });
    if (product) return true;
    return false;
  }

  public async getProductsByUserId(userId: string): Promise<Product[]> {
    return await ProductModel.find({ user_id: userId });
  }
  public async getProductById(id: string): Promise<Product> {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }
  public async getProductByEanAndUserId(
    ean: string,
    userId: string
  ): Promise<Product> {
    const product = await ProductModel.findOne({ ean, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  //TODO: check if ean is unique for user
  public async createProduct(product: Product): Promise<Product> {
    if (
      await this.checkIfEanAlreadyExistsForUser(
        product.user_id.toString(),
        product.ean
      )
    )
      throw new ResourceAlreadyExistsError(
        "Product with this EAN already exists for this user"
      );

    const newProduct = new ProductModel(product);
    return await newProduct.save();
  }

  //TODO: check if ean is unique for user
  public async updateProduct(
    id: string,
    updateProductObject: Partial<Omit<Product, "_id">>
  ): Promise<Product> {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    if (updateProductObject.ean !== undefined) {
      if (
        await this.checkIfEanAlreadyExistsForUser(
          updateProductObject.user_id
            ? updateProductObject.user_id.toString()
            : product.user_id.toString(),
          updateProductObject.ean
        )
      )
        throw new ResourceAlreadyExistsError(
          "Product with this EAN already exists for this user"
        );
      product.ean = updateProductObject.ean;
    }
    if (updateProductObject.name !== undefined)
      product.name = updateProductObject.name;
    if (updateProductObject.description !== undefined)
      product.description = updateProductObject.description;

    return await product.save();
  }

  //TODO: delete all items related to product
  public async deleteProductById(id: string): Promise<void> {
    const deleteResponse = await ProductModel.deleteOne({
      _id: id,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }
  }
  public async deleteProductByEanAndUserId(
    ean: string,
    userId: string
  ): Promise<void> {
    const deleteResponse = await ProductModel.deleteOne({
      ean,
      user_id: userId,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }
  }
}
