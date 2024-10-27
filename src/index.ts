import express, { Request, Response } from "express";

import productsRoutes from "./routes/products.routes";
import globalErrorHandlerMiddleware from "./middlewares/globalErrorHandlerMiddleware";
import authRoutes from "./auth/authRoutes";
import database from "./database/database";
import { env } from "./config/env";

const app = express();

database.connect();

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend");
});

app.use("/products", productsRoutes);

app.use("/auth", authRoutes);

app.use(globalErrorHandlerMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
