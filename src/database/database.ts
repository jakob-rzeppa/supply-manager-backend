import mongoose from "mongoose";
import "dotenv/config";
import productDatabase from "./productDatabase";
import userDatabase from "./userDatabase";
import { env } from "../config/env";

const database = {
  connect: () => {
    mongoose.connect(env.MONGO_URI!);
    console.log("connected to database");
  },
  products: productDatabase,
  users: userDatabase,
};

export default database;
