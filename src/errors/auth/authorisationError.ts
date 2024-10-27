import RuntimeError from "../runtimeError";

export default class AuthorisationError extends RuntimeError {
  constructor(message: string = "Authorisation failed", status: number = 403) {
    super(message, status);
    this.name = "AuthorisationError";
  }
}
