import RuntimeError from "../runtimeError";

export default class ValidationError extends RuntimeError {
  constructor(message: string = "Request Validation failed") {
    super(message, 400);
    this.name = "ValidationError";
  }
}
