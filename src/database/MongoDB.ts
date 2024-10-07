import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

let client: MongoClient | undefined = undefined;

export async function getMongoClient() {
  if (!client) {
    if (!MONGO_URI) throw new Error("MONGO_URI must be provided");
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("Connected to MongoDB");
  }

  return client;
}

export type MongoDatabases = "supply-manager-db";
export type MongoCollections = "users" | "products" | "items";

export async function getMongoCollection(
  dbName: MongoDatabases,
  collectionName: MongoCollections
) {
  const client = await getMongoClient();
  return client.db(dbName).collection(collectionName);
}
