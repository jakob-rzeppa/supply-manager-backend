import { catchPromiseError } from "../../utilityFunctions/errorHandling";

describe("catchPromiseError", () => {
  it("should return data when promise resolves", async () => {
    const data = "resolved data";
    const promise = Promise.resolve(data);

    const result = await catchPromiseError(promise);

    expect(result).toEqual([undefined, data]);
  });

  it("should return error when promise rejects", async () => {
    const error = new Error("rejected error");
    const promise = Promise.reject(error);

    const result = await catchPromiseError(promise);

    expect(result).toEqual([error]);
  });

  it("should return error when promise rejects with a specified error type", async () => {
    class CustomError extends Error {}
    const error = new CustomError("custom error");
    const promise = Promise.reject(error);

    const result = await catchPromiseError(promise, [CustomError]);

    expect(result).toEqual([error]);
  });

  it("should throw error when promise rejects with an unspecified error type", async () => {
    class CustomError extends Error {}
    const error = new Error("generic error");
    const promise = Promise.reject(error);

    await expect(catchPromiseError(promise, [CustomError])).rejects.toThrow(
      error
    );
  });
});
