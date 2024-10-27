import { NextFunction, Request, Response } from "express";
import RuntimeError from "../errors/runtimeError";

export default function globalErrorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.stack);

  if (err instanceof RuntimeError) {
    err.sendResponse(res);
  }

  res.status(500).json({ error: "Internal Server Error" });
}
