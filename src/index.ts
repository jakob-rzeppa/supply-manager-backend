import express, { Request, Response } from "express";
import "jsr:@std/dotenv/load";

import productsRoutes from "./routes/productsRoutes.ts";

const app = express();

const port = Deno.env.get("PORT");
if (!port) throw new Error("PORT must be provided");

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend");
});

app.use(express.json());

app.use("/products", productsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
