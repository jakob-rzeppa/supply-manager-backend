import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import "dotenv/config";
import bodyParser from "body-parser";

import getProductsRoutes from "./routes/products.routes";
import Database from "./database/database";
import globalErrorMiddleware from "./middlewares/globalErrorMiddleware";

async function createApp(db: Database) {
  const app = express();

  await db.connect();

  const port = process.env.PORT;
  if (!port) throw new Error("PORT must be provided");

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get("/", (_req: Request, res: Response) => {
    res.send("Supply-Manager-Backend");
  });

  const productsRoutes = getProductsRoutes(db);

  app.use("/products", productsRoutes);

  app.use(globalErrorMiddleware);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

async function main() {
  const db = await Database.getInstance();
  createApp(db);
}

main();
