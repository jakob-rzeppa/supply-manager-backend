import { Response } from "express";

export default class RuntimeError extends Error {
  protected responseStatus: number;

  constructor(
    message: string = "An unexpected error occurred",
    responseStatus: number = 500
  ) {
    super(message);
    this.name = "RuntimeError";
    this.responseStatus = responseStatus;
  }

  getResponseStatus() {
    return this.responseStatus;
  }

  sendResponse(res: Response) {
    return res.status(this.responseStatus).json({ error: this.message });
  }
}
