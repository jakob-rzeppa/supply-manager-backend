import express, { Request, Response } from "express";
import "jsr:@std/dotenv/load";

const app = express();

const port = Deno.env.get("PORT");
if (!port) throw new Error("PORT must be provided");

app.get("/", (_req: Request, res: Response) => {
  res.send("Supply-Manager-Backend");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
