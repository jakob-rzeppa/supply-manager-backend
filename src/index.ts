import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import getProductsRoutes from "./routes/products.routes";
import Database from "./database/database";

const app = express();

const port = process.env.PORT;
if (!port) throw new Error("PORT must be provided");

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend!");
});

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
