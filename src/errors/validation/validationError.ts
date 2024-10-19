import RuntimeError from "../runtimeError";

export default class ValidationError extends RuntimeError {
  constructor(
    message: string = "Request Validation failed",
    status: number = 400
  ) {
    super(message, status);
    this.name = "ValidationError";
  }
}
