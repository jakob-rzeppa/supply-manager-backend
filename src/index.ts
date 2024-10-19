import express, { Request, Response } from "express";
import "dotenv/config";

import productsRoutes from "./routes/products.routes";
import Database from "./database/database";
import globalErrorHandlerMiddleware from "./middlewares/globalErrorHandlerMiddleware";
import authMiddleware from "./auth/authMiddleware";
import authRoutes from "./auth/authRoutes";
import database from "./database/database";

const app = express();

database.connect();

const port = process.env.PORT;
if (!port) throw new Error("PORT must be provided");

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend");
});

app.use("/products", productsRoutes);

app.use("/auth", authRoutes);

app.use(globalErrorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
