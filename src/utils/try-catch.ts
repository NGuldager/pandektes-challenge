// sources:
// https://gist.github.com/t3dotgg/a486c4ae66d32bf17c09c73609dacc5b
// https://github.com/bdsqqq/try/blob/main/src/index.ts
// https://www.youtube.com/watch?v=ITogH7lJTyE

import { firstValueFrom, Observable } from 'rxjs';

const formatError = <E = Error>(error: any): E => {
  if (error === undefined || error === null) {
    return new Error() as E;
  }

  if (!error || typeof error === 'string') {
    return new Error(`${error}`) as E;
  }

  return error as E;
};

export async function tryCatch<T, E = Error>(func: (() => T) | Promise<T>) {
  try {
    const data = await (func instanceof Promise
      ? func
      : Promise.resolve(func()));

    return [data, null] as const;
  } catch (error) {
    return [null, formatError<E>(error)] as const;
  }
}

export async function tryCatchObservable<T, E = Error>(
  observable: Observable<T>,
) {
  return tryCatch<T, E>(firstValueFrom(observable));
}
