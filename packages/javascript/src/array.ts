export type ReplaceKeyFn = (
  element: any,
  index: number,
  array: any[]
) => number;

/**
 * replace an element in the array with another value
 * @param array
 * @param key it can be a callback for Array.findIndex(), or any other value for Array.indexOf()
 * @param value
 */
export function replace(array: any[], key: ReplaceKeyFn | any, value: any) {
  let index =
    typeof key === 'function' ? array.findIndex(key) : array.indexOf(key);

  // ~-1 =true, !-1 = false
  if (~index) {
    array[index] = value;
  }

  return array;
}
