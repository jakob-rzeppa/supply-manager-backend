import RuntimeError from "../runtimeError";

export default class ResourceAlreadyExistsError extends RuntimeError {
  constructor(message: string = "Supplied Resource already exists") {
    super(message, 409);
    this.name = "ResourceAlreadyExistsError";
  }
}
