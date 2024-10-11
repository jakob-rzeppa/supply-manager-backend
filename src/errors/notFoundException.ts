export default class NotFoundException extends Error {
  constructor(message: string = "Requested Resource not found") {
    super(message);
    this.name = "NotFoundException";
  }
}
