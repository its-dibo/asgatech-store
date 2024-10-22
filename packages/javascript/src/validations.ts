import { objectType } from './objects';

export interface IsEmptyOptions {
  /** whether to trim the string before checking it */
  trim?: boolean;
  /** whether to consider '0' as empty */
  allowZero?: boolean;
}
/**
 * check is the value is empty
 * it considered empty if
 *   - it is undefined or null
 *   - an empty string after trimming if options.trim is true
 *   - the number zero, if options.allowZero is false
 *   - an empty array
 *   - an empty object
 * @param value
 * @returns
 */
export function isEmpty(value?: any, options?: IsEmptyOptions) {
  let opts: IsEmptyOptions = {
    trim: true,
    allowZero: false,
    ...options,
  };
  return !(
    [undefined, null].includes(value) ||
    (typeof value === 'string' && (opts.trim ? value.trim() : value) === '') ||
    (typeof value === 'number' && !opts.allowZero && value === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (objectType(value) === 'object' && Object.keys(value).length === 0)
  );
}
