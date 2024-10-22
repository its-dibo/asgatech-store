import { CleanStringOptions, cleanString } from './string';

export type Pattern = string | RegExp | Array<string | RegExp>;
export type Filter = (value: any) => boolean;

/**
 * escape regex string
 * https://github.com/sindresorhus/escape-string-regexp
 * https://github.com/TypeStrong/ts-loader/issues/653#issuecomment-658129853
 *
 * @function escape
 * @param  value
 * @returns escaped value
 */
export function escape(value: string): string {
  return value.replaceAll(/[$()*+./?[\\\]^{|}]/g, '\\$&');
}

export interface CleanOptions extends CleanStringOptions {
  escape?: boolean;
}

/**
 *
 * @param value
 * @param options
 * @returns
 */
export function clean(value: string, options: CleanOptions = {}): string {
  value = cleanString(value, options);
  return options.escape ? escape(value) : value;
}

export interface ToRegExpOptions extends CleanOptions {
  flags?: string;
  // the delimiter between parts in case of an array value, default: no delimiter
  delimiter?: string;
}
/**
 * converts strings and array of strings into a RegExp, escaping and cleaning the multi-line strings
 * by removing comments and break lines
 *
 * @function toRegex
 * @param  value
 * @param  optionsOrFlags
 * @returns
 */
export function toRegExp(
  // todo: Array<string | RegExp>
  value: Pattern,
  optionsOrFlags: ToRegExpOptions | string = {},
): RegExp {
  let opts = {
    delimiter: '',
    ...(typeof optionsOrFlags === 'string'
      ? { flags: optionsOrFlags }
      : optionsOrFlags),
  };

  if (typeof value === 'string') {
    value = clean(value, opts);
  } else if (Array.isArray(value)) {
    // todo: if(delimiter==='') remove ^,$ from the inner parts
    value = value
      .map(
        (element) =>
          // we don't need to escape a RegExp pattern, only escape strings
          `(?:${
            element instanceof RegExp
              ? element.source
              : clean(element.toString(), opts)
          })`,
      )
      .join(opts.delimiter);
  } else if (value instanceof RegExp) {
    // todo: add the new flags
  } else {
    throw new TypeError(`value ${value} must be of type Pattern`);
  }
  return new RegExp(value, opts.flags);
}

/**
 * creates a filter function from a pattern
 *
 * @param pattern
 * @param flags
 * @param escapeString
 * @param regexOptions
 * @example
 * filter('x') => value=>/x/.test(value)
 * filter(['x', 'y']) => value=>/(?:x)(?:y)/.test(value)
 * ['ok1','ok2','other'].filter(filter(/ok/))
 * @returns
 */
export function toFilter(
  pattern?: Filter | Pattern,
  regexOptions: ToRegExpOptions = {},
): Filter {
  if (!pattern) {
    // always include the value
    return () => true;
  } else if (typeof pattern !== 'function') {
    return (value: any) => toRegExp(pattern, regexOptions).test(value);
  }
  return pattern;
}

/**
 * merge multiple patterns into a single pattern
 * same as toRegExp() but removes [^$] from inner parts,
 * and removes '$' only from the first part, and '^' only from the last one
 *
 * @param parts
 * @param options
 * @returns
 *
 * @deprecated: use toRegExp(parts) direct
 */
export function mergePatterns(
  parts: (RegExp | string)[],
  options: ToRegExpOptions = {},
): RegExp {
  return toRegExp(parts, options);
}
