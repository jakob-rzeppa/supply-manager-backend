import RuntimeError from "../runtimeError";

export default class NotFoundException extends RuntimeError {
  constructor(message: string = "Requested Resource not found") {
    super(message, 404);
    this.name = "NotFoundException";
  }
}
