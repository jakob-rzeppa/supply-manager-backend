import RuntimeError from "../runtimeError";

export default class AuthenticationError extends RuntimeError {
  constructor(message: string = "Authentication failed", status: number = 401) {
    super(message, status);
    this.name = "AuthenticationError";
  }
}
