import ValidationError from "./validationError";

export default class LocalsValidationError extends ValidationError {
  constructor(
    message: string = "Locals Validation Failed",
    status: number = 500
  ) {
    super(message, status);
    this.name = "LocalsValidationError";
  }
}
