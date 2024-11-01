import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import productsRoutes from "./routes/productsRoutes";
import globalErrorHandlerMiddleware from "./middlewares/globalErrorHandlerMiddleware";
import authRoutes from "./routes/authRoutes";
import database from "./database/database";
import { env } from "./config/env";
import authMiddleware from "./middlewares/authMiddleware";
import swaggerSpec from "./config/swaggerConfig";

const app = express();

database.connect();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend");
});

app.use("/products", authMiddleware, productsRoutes);

app.use("/auth", authRoutes);

app.use(globalErrorHandlerMiddleware);

app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});
