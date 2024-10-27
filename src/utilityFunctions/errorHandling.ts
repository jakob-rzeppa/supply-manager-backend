export async function catchPromiseError<
  T,
  E extends new (message?: string) => Error
>(promise: Promise<T>, errorsToCatch?: E[]): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((err) => {
      if (errorsToCatch == undefined) {
        return [err];
      }

      if (errorsToCatch.some((e) => err instanceof e)) {
        return [err];
      }

      throw err;
    });
}
