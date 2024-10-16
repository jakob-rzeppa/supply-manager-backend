import RuntimeError from "../runtimeError";

export default class AuthorisationError extends RuntimeError {
  constructor(message: string = "Authorisation failed") {
    super(message, 403);
    this.name = "AuthorisationError";
  }
}
