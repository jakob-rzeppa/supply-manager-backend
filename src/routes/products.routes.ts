import { Router, Request, Response } from "express";
import boom from "boom";

import Database from "../database/database";

//TODO middleware to check if user is authenticated
const getProductsRoutes = (db: Database) => {
  const productsRoutes = Router();

  productsRoutes.get("/", async (req: Request, res: Response) => {});

  productsRoutes.get("/:id", async (req: Request, res: Response) => {});

  productsRoutes.post("/", async (req: Request, res: Response) => {});

  productsRoutes.put("/:id", async (req: Request, res: Response) => {});

  productsRoutes.delete("/:id", async (req: Request, res: Response) => {});

  return productsRoutes;
};

export default getProductsRoutes;
