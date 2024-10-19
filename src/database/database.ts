import mongoose from "mongoose";
import "dotenv/config";
import productDatabase from "./productDatabase";
import userDatabase from "./userDatabase";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI must be defined");
}

const database = {
  connect: () => {
    mongoose.connect(MONGO_URI!);
    console.log("connected to database");
  },
  products: productDatabase,
  users: userDatabase,
};

export default database;
