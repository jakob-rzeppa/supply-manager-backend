import RuntimeError from "../runtimeError";

export default class NotFoundError extends RuntimeError {
  constructor(message: string = "Requested Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
