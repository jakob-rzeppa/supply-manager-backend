import RuntimeError from "../runtimeError";

export default class AuthenticationError extends RuntimeError {
  constructor(message: string = "Authentication failed") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}
