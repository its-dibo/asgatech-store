import { toRegExp } from './regex';

export interface ReplaceAllOptions {
  // recursively perform replaceAll()
  // example "a----b".replaceAll('--','-') doesn't perform a recursive replacement
  // and returns 'a--b' instead of 'a-b'
  recursive?: boolean;
}

/**
 * replaces all `replace` parts in a string.
 * by adding the 'global' flag to the replace pattern
 * String.replace() only replaces the first occurrence
 *
 * @function replaceAll
 * @param  element
 * @param  replace
 * @param options
 * @param  replaceWith will be casted to string
 * @returns the new string, or an array contains the new strings
 * @example replaceAll("abxcdx",'x','y') => "abycdy"
 *
 * todo: replaceAll("abcd",["a","c"],"x") => "xbxd"
 */
export function replaceAll(
  element: string | Array<string>,
  replace: string | RegExp | Array<string | RegExp>,
  replaceWith: string,
  options?: ReplaceAllOptions
): string | Array<any> {
  if (Array.isArray(element)) {
    // el may be a nested array, in this case replaceAll() will return Array<>
    // so element.map() here may return Array<Array> instead of Array<string>
    // so replaceAll() returns Array<any> instead of Array<string>
    return element.map((el: any) =>
      replaceAll(el, replace, replaceWith, options)
    );
  }

  if (Array.isArray(replace)) {
    for (let item of replace) {
      element = replaceAll(element, item, replaceWith, options);
    }
    return element;
  }

  // add 'global' flag
  if (typeof replace === 'string') {
    // replace must be escaped,
    // to prevent replaceAll(value,'.','replaceWith') from replacing everything
    // instead of replacing '.' only
    replace = toRegExp(replace, {
      flags: 'g',
      escape: true,
      // allow replacing line breaks
      // example: replaceAll(txt, '\n\n', '\n')
      removeBreakLines: false,
    });
  }

  // string.replaceAll()  requires target es2021
  let result = element.replace(replace, replaceWith.toString());
  if (options?.recursive) {
    while (element && element !== result) {
      element = result;
      result = replaceAll(result, replace, replaceWith, {
        ...options,
        recursive: false,
      }) as string;
    }
  }

  return result;
  // faster than element.split(replace).join(replaceWith)
  // https://jsperf.com/replace-all-vs-split-join
}

/**
 * asynchronously replace a part of a string
 *
 * @function replaceAsync
 * @param str
 * @param regex
 * @param replacer a function that returns a promise that resoles to `replaceWith`
 * @returns
 *
 * todo: merge replaceAsync() with replaceAll(), where replaceWith: (()=>Promise<string>)
 */
/*
 https://github.com/RSamaium/async-replace
todo:
 - regex = Regex | string
 - replacer: any (string | fn:()=>any | async fn | promise | any other type (cast to string))
   ex: replacer may be a promise or a function that returns a promise
 */
/**
 *
 * @param element
 * @param regex
 * @param replacer
 * @returns
 */
// todo: use the same signature as replaceAll()
export function replaceAsync(
  element: string,
  regex: RegExp,
  replacer: (...matched: any[]) => Promise<string>
): Promise<string> {
  let matched = element.match(regex);
  if (!matched) {
    return Promise.resolve(element);
  }
  // if regex is global (i.e: /regex/g) we need to recursively apply the replacement
  if (regex.global) {
    let index_ = 0,
      index = 0,
      result: string[] = [],
      // eslint-disable-next-line security-node/non-literal-reg-expr
      copy = new RegExp(regex.source, regex.flags.replace('g', '')),
      callbacks: any = [];

    while (matched.length > 0) {
      // remove the first element and return it
      let substr: string = matched.shift() || '';
      // position of substr after the current index
      let nextIndex = element.indexOf(substr, index);
      result[index_] = element.slice(index, nextIndex);
      index_++;
      let index__ = index_;
      callbacks.push(
        replacer(...(substr.match(copy) || []), nextIndex, element).then(
          (newString: any) => {
            result[index__] = newString;
          }
        )
      );
      index = nextIndex + substr.length;
      index_++;
    }
    result[index_] = element.slice(index);
    return Promise.all(callbacks).then(() => result.join(''));
  } else {
    return replacer(...matched).then((newString: any) =>
      element.replace(regex, newString)
    );
  }
}

/**
 * perform replace() recursively
 * https://stackoverflow.com/a/14806999/12577650
 *
 * @param value
 * @param pattern
 * @param newValue
 * @example
 * replaceRecursive('xxx',/x/,'x') -> result: `x`
 * 'xxx'.replace(/x/,'x') -> result: `xx`
 * @returns
 */
export function replaceRecursive(
  value: string,
  pattern: RegExp,
  newValue: string
): string {
  let newString = value.replace(pattern, newValue);
  return newString === value
    ? newString
    : replaceRecursive(newString, pattern, newValue);
}

// eslint-disable-next-line no-secrets/no-secrets
/**
 * converts a string to a number if possible
 * useful if the value always been passed as a string,
 * for example when it received from `cli` or asa url parameter
 * https://github.com/substack/minimist/blob/aeb3e27dae0412de5c0494e9563a5f10c82cc7a9/index.js#L240
 *
 * @param value
 * @returns a number if it could e converted, or the original value
 */
export function toNumber(value: string | number): number | string {
  if (typeof value === 'number') {
    return value;
  }
  if (
    // hexadecimal numbers, example: 0xFF
    /^0x[\da-f]+$/i.test(value) ||
    // example: +1.2e-5
    /^[+-]?\d+(?:\.\d*)?(?:e[+-]?\d+)?$/.test(value)
  ) {
    return Number(value);
  }

  return value;
}

/**
 * convert kabab-case strings into camelCase
 *
 * @param value kabab-case string
 * @param upperFirstChar upperCase the first char
 * @returns camelCase string
 * @example toCamelCase('hello-world'); -> helloWorld
 */
// todo: toKababCase()
export function toCamelCase(value: string, upperFirstChar = false): string {
  let camelCaseValue = value.replace(/-(.)/g, (match, chr) =>
    chr.toUpperCase()
  );
  return upperFirstChar ? toUpperCaseFirst(camelCaseValue) : camelCaseValue;
}

/**
 * capitalizes the first letter
 *
 * @param value
 * @returns
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * upperCase the first char
 *
 * @param value
 */
export function toUpperCaseFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface CleanStringOptions {
  escape?: boolean;
  removeComments?: boolean;
  removeBreakLines?: boolean;
  trim?: boolean;
}

/**
 * remove comments, break lines and trim the string from multi-line strings
 * by default it cleans the string
 *
 * @param value
 * @param options
 * @returns
 */
export function cleanString(
  value: string,
  options: CleanStringOptions = {}
): string {
  let opts: CleanStringOptions = {
    // remove '//' comments
    // it is better to disable this option to avoid removing comment-like strings by mistake
    // suc as `https://`
    removeComments: false,
    // remove break lines for multi-line string
    removeBreakLines: true,
    // trim each line of the multi-line string
    trim: false,
    ...options,
  };

  if (opts.removeComments) value = value.replace(/\s*\/\/.*$/gm, '');
  if (opts.removeBreakLines)
    value = value
      .split('\n')
      .map((line) => (opts.trim ? line.trim() : line))
      .join('');
  if (opts.trim) value = value.trim();
  return value;
}

/**
 * convert a camelCase or PascalCase into kabab-case
 *
 * @param value
 * @returns
 * @examplele MyExample -> my-example
 */
export function toKababCase(value: string): string {
  return value
    .split('')
    .map((char, idx) => {
      return char.toUpperCase() === char
        ? `${idx === 0 ? '' : '-'}${char.toLowerCase()}`
        : char;
    })
    .join('');
}

/* todo:
  export interface String {
    replaceAll(
      str: string,
      replace: string | RegExp,
      replaceWith: string
    ): string;
  }
  String.prototype.replaceAll = replaceAll;
  or proto('method')=> string.prototype...
  */
