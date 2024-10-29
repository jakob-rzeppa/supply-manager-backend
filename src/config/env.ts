import "dotenv/config";

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT must be provided");
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI must be provided");
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET must be provided");
}

export const env = {
  PORT,
  MONGO_URI,
  ACCESS_TOKEN_SECRET,
};
