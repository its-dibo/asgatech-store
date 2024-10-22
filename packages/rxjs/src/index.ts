import { Observable, from, isObservable, of } from 'rxjs';

export type Async<T> = T | Promise<T> | Observable<T>;
/**
 * converts non-observable values to rxjs.observable
 * useful if you function expects to receive a value or an observable that emits the value
 * if the provided value is a Promise, the fulfilled value is emitted instead of Promise<value>
 *
 * @param value
 */
export function toObservable<T>(value: Async<T>): Observable<T> {
  return isObservable(value)
    ? value
    : value instanceof Promise
    ? // to emit the fulfilled value instead of Promise
      from(value)
    : // emits array-like at once
      of(value);
}
