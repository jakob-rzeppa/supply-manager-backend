import { Router, Request, Response } from "express";
import Database from "../database/database.ts";

const getProductsRoutes = (db: Database) => {
  const productsRoutes = new Router();

  productsRoutes.get("/", async (_req: Request, res: Response) => {
    const products = await db.getProductById("ffffffffffffffffffffffff");
    res.send(products);
  });

  return productsRoutes;
};

export default getProductsRoutes;
