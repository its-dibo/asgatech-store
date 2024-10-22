/**
 * javascript objects
 */

export interface Obj<T = any> {
  [key: string]: T;
}

/**
 * get the object type as lowercase string. i.e: string, array, number, ...
 *
 * @example
 *  {} => object
 *  [] => array
 *  null => null
 *  function(){} => function
 *  1 => number
 *  "x", 'x', `x` => string
 * @function objectType
 * @param  object
 * @returns
 */
export function objectType(object: any): string {
  return Object.prototype.toString
    .call(object)
    .replace('[object ', '')
    .replace(']', '')
    .toLowerCase();
}
export interface IncludesOptions {
  // for string elements, default: false
  caseSensitive?: boolean;
  // for object containers, default: key
  find?: 'key' | 'value';
  // determine whether to treat array elements as a single item, or iterate over them
  elementAsItem?: boolean;
}

/**
 * check if the container includes the element
 *
 * @function includes
 * @param  element the element that you want to search for
 * @param  container
 * @param  options
 * @returns boolean
 *
 * todo: add more container types (class,. ...)
 * todo: support RegExp in array containers, ex: includes('x', [/x/])
 * todo: return {matched:true, value: matchedValue};
 *       this helps inspecting the matched regexp;
 *       don't return the value, because it may be === false
 * todo: for object containers: options.find='key' | 'value'
 */
export function includes(
  element: any,
  container: Array<any> | object | string,
  options?: IncludesOptions,
): boolean {
  let defaultOptions = {
    caseSensitive: false,
    elementAsItem: true,
    find: 'key',
  };
  options = Object.assign(defaultOptions, options || {});

  // if element is Array, check if the container includes any of element[] items
  // todo: options.all=true, to check if the container includes *all* of them
  if (Array.isArray(element) && options?.elementAsItem === false) {
    for (let item of element) {
      if (includes(item, container, options)) {
        return true;
      }
    }
    return false;
  }

  if (element instanceof RegExp) {
    if (typeof container === 'string') {
      // ex: includes(/x/, 'xyz')
      return element.test(container);
    } else if (Array.isArray(container)) {
      // ex: includes(/x/, ['x','y','z'])
      for (let item of container) {
        if (includes(element, item)) {
          return true;
        }
      }
      return false;
    } else if (objectType(container) === 'object') {
      // ex: includes(/x/, {x:1})
      return includes(element, Object.keys(container));
    }
  } else if (objectType(element) === 'object') {
    // ex: includes({x:1}, ['x'])
    return includes(Object.keys(element), container);
  }

  if (!options?.caseSensitive && typeof element === 'string') {
    element = element.toLowerCase();
  }
  if (typeof container === 'string') {
    // ex: includes('x', 'xyz')
    return container.includes(element);
  } else if (Array.isArray(container)) {
    // ex: includes('x', ['x','y','z'])
    return container.includes(element);
  } else if (objectType(container) === 'object') {
    // ex: includes('x', {x:1})
    return element in container;
  } else if (isIterable(container)) {
    // todo: other iterable types
  }

  // todo: throw exception if the container is not iterable
  return false;
}

/**
 * check if the element is iterable, but not a string.
 *
 * @param object
 * @returns boolean
 */
export function isIterable(object: any): boolean {
  // in case of 'null', it returns null, so we need to cast it into boolean
  // using `!!`

  return !!(
    ['array', 'object'].includes(objectType(object)) ||
    (object &&
      typeof object[Symbol.iterator] === 'function' &&
      typeof object !== 'string')
  );
}

/**
 * check if the object a promise or a promise-like, i.e has `.then()`
 *
 * @param object
 * @returns
 *
 */

// todo: check isPromise from 'node:util/types'
export function isPromise(object: any): boolean {
  return !!(
    object instanceof Promise ||
    (object && typeof object.then === 'function')
  );
}

export function toPromise<T>(value: T | Promise<T>): Promise<T> {
  return isPromise(value) ? (value as Promise<T>) : Promise.resolve(value);
}

/**
 * check if the value is empty
 * the value is considered empty if it is:
 *  - undefined or null
 *  - an empty string (after trimming)
 *  - an empty array or object
 * if the value is 'false', it is not empty
 * the value is not casted, so if it is "0", it is not empty
 * @param value
 * @returns
 */
export function isEmpty(value: any): boolean {
  return (
    // value = undefined || null || "" || 0
    (!value && value !== false) ||
    (typeof value === 'string' && value.trim() === '') ||
    // note that in js: `[]!=[]` and `{}!={}` because every one is a new instance.
    // don't use `if(value==[])return true`
    (Array.isArray(value) && value.length === 0) ||
    (objectType(value) === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * divide Array into chunks
 *
 * @function chunk
 * @param  array
 * @param  chunkSize number of elements of each chunk
 * @returns an array of chunks
 * @example chunk([1,2,3,4], 2) => [ [1,2], [3,4]]
 */
export function chunk(
  array: Array<any>,
  chunkSize?: number,
): Array<Array<any>> {
  if (chunkSize === 0 || chunkSize === undefined) {
    chunkSize = array.length;
  } else if (chunkSize < 0) {
    throw new Error('chunkSize must be >= 0');
  }

  let result = [];
  for (let index = 0; index < array.length; index += chunkSize) {
    result.push(array.slice(index, index + chunkSize));
  }
  return result;
}

/**
 * remove circular references from the object
 *
 * @param object
 * @returns the clean object after removing the circular references
 */
export function cleanObject(object: Obj): Obj {
  if (objectType(object) !== 'object') {
    throw new Error('the element is not an object');
  }
  // todo: https://stackoverflow.com/questions/7582001/is-there-a-way-to-test-circular-reference-in-javascript/7583161#7583161

  return object;
}

/**
 * filter objects by keys
 *
 * @example
 *   object = {a:1, b:2, c:3, d: 4}
 *   keys = ['a', 'b']
 *   filterObjectByKeys(object, keys) -> {a:1, b:2}
 * @param object
 * @param keys
 * @returns
 */
export function filterObjectByKeys(object: Obj, keys: Array<string>): Obj {
  // https://stackoverflow.com/a/47443227/12577650
  return Object.fromEntries(keys.map((key) => [key, object[key]]));

  // or: https://stackoverflow.com/a/54976713/12577650
  // return Object.assign({}, ...keys.map((key) => ({ [key]: keys[key] })));
}

/**
 * converts string with dot notation into an object key
 *
 * @param keys
 * @param value
 * @example 'a.b.c' -> {a: {b:{ c: value}}}
 * @returns
 */
export function dotNotationToObject(
  keys: string | Array<string>,
  value?: any,
): Obj {
  let object: Obj = {};
  if (typeof keys === 'string') {
    keys = keys.split('.');
  }

  let temporary = object;

  for (let index = 0; index < keys.length - 1; index++) {
    let key: string = keys[index];

    if (!(key in temporary)) {
      temporary[key] = {};
    }

    temporary = temporary[key];
  }

  // last element
  let _key = keys.at(-1);
  temporary[_key!] = value;

  return object;
}

/**
 * converts an object-like string into a plain object
 *
 * @param value accepts two formats: `key=value` or `JSON.stringify({...}}`
 * @param pairsDelimiter
 * @param keyValueDelimiter
 * @returns
 * @example '{k1:"v1", k2:"v2"}'
 * @example '["value"]'
 * @example 'k1=v1,k2=v2'
 * todo: support 'v1,v2' => ['v1', 'v2']
 */
export function parseObject(
  value?: string,
  pairsDelimiter = ',',
  keyValueDelimiter = '=',
): { [key: string]: any } {
  if (!value) return {};
  value = decodeURIComponent(value);
  let object: { [key: string]: string } = {};

  if (value.startsWith('{') || value.startsWith('[')) {
    // example: '{k1:"v1", k2:"v2"}' or '["value"]'
    object = JSON.parse(value);
  } else if (value.includes(keyValueDelimiter)) {
    // example: 'k1=v1,k2=v2'
    value.split(pairsDelimiter).forEach((element: string) => {
      let [key, value] = element.split(keyValueDelimiter);
      object[key] = value;
    });
  } else {
    throw new Error(`invalid value: ${value}`);
  }

  return object;
}

/**
 * flatten the nested objects into the top-level as a dot-notation string
 * use case: sending the object to a plain-text environment such as cli or as a url parameter.
 * https://stackoverflow.com/a/69246829/12577650
 *
 * @param value
 * @param delimiter
 * @example {a:{b:1, {x:{y:2}}}} -> {a.b:1, a.x.y:2 }
 * @returns
 */
export function flatten(value: Obj, delimiter = '.'): Obj {
  /**
   *
   * @param object
   * @param parent
   * @returns
   */
  function walk(object: Obj, parent = ''): Obj {
    parent = parent.trim();
    let result: Obj = {};
    for (let [key, value_] of Object.entries(object)) {
      let prefix = parent === '' ? key : `${parent}${delimiter}${key}`;

      if (objectType(value_) === 'object') {
        let flattened = walk(value_, prefix);
        // todo: remove keys from flattened
        Object.assign(result, flattened);
      } else {
        result[prefix] = value_;
      }
    }
    return result;
  }

  return walk(value);
}

/**
 * renames an object key and returns the new object, doesn't mutate the original object
 *
 * @param object
 * @param oldKey
 * @param newKey
 * @returns object
 */
function renameObjectKey(object: Obj, oldKey: string, newKey: string): Obj {
  if (!(oldKey in object)) {
    return object;
  }

  // no need to make a deep copy, we just rename the first-level keys
  let newObj = Object.assign({}, object, { [newKey]: object[oldKey] });
  delete newObj[oldKey];
  return newObj;
}

/**
 * performs renameObjectKey() for the provided keyMapping at once
 *
 * @param object
 * @param keyMapping a map between old and new key names {oldKey: newKey}
 * @returns object
 */
function renamObjectKeys(
  object: Obj,
  keyMapping: { [oldKey: string]: string },
): Obj {
  let newObj = Object.assign({}, object);
  for (let key in keyMapping) {
    newObj = renameObjectKey(newObj, key, keyMapping[key]);
  }
  return newObj;
}

/**
 * returns a slice of the object with the selected keys
 * @param obj
 * @param keys
 * @returns
 */
export function objectSlice(obj: { [key: string]: any }, keys: string[]) {
  return keys.reduce(
    (acc, el) => {
      acc[el] = obj[el];
      return acc;
    },
    <{ [key: string]: any }>{},
  );
}
