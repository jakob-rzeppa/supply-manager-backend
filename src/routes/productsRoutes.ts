import { Router, Request, Response } from "express";

const productsRoutes = new Router();

productsRoutes.get("/", async (_req: Request, res: Response) => {});

export default productsRoutes;
