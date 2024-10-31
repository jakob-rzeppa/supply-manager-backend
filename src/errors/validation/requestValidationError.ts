import ValidationError from "./validationError";

export default class RequestValidationError extends ValidationError {
  constructor(
    message: string = "Request Validation Failed",
    status: number = 400
  ) {
    super(message, status);
    this.name = "RequestValidationError";
  }
}
