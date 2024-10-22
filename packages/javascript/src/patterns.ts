/* eslint-disable security-node/non-literal-reg-expr */
import { ToRegExpOptions, escape, toRegExp } from './regex';

/**
 * use unicode ranges to allow unicode characters
 * you need to add the flag 'u'
 */
// https://dev.to/tillsanders/let-s-stop-using-a-za-z-4a0m
// https://www.regular-expressions.info/unicode.html#category
export let unicodeRanges = {
  // any numeric character in any script
  numbers: `\\p{N}`,
  // any letter from any language
  // https://stackoverflow.com/a/15861883/12577650
  letters: `\\p{L}`,
  // combination of this.numbers, this.letters
  // doesn't include other characters like "-"
  any: `\\p{N}\\p{L}`,
  // Arabic letters: "\u0621-\u064A" or "\p{Arabic}" or "ء-ي"
  // Arabic numbers: "\u0660-\u0669"
  // https://stackoverflow.com/a/29729405/12577650
  // https://stackoverflow.com/a/29729400/12577650
  arabic: `\u0621-\u064A\u0660-\u0669`,
};

/**
 * ip v4
 * matches: x.x.x.x, where "0 <= x <= 255" with no leading zero
 * doesn't match private networks' ip, 127.0.0.1
 *
 * @example
 * 192.0.0.1 valid
 * 192.0.0.01 invalid (leading zero)
 */
// https://stackoverflow.com/a/36760050/12577650
// https://leetcode.com/problems/validate-ip-address/
// simple pattern /(\d{1,3}\.){3}\d{1,3}/;
// pattern: each part matches: (25[0-5] | 2[0-4]d | 1dd | [1-9]), where d is a digit
export let ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|\d)\.?){4}$/;

/**
 * ip v6
 * consists of 8 hexadecimal groups separated by ":", one or more leading zeros could be removed
 * Consecutive groups of zeros may be replaced with ":", ":" may only used once in the whole address (compressed ipv6)
 * ipv6 can include ipv4 component
 *
 * @examples
 * 2001:0db8:0000:0000:0000:ff00:0042:8329 -> valid
 * 2001:db8:0:0:0:ff00:42:8329 -> valid (leading-zeros removed)
 * 2001:db8::ff00:42:8329 -> valid (using "::")
 * 2001:db8:3333:4444:5555:6666:7777:1.2.3.4 -> valid (contains ipv4 component)
 */
// http://sqa.fyicenter.com/1000334_IPv6_Address_Validator.html
// https://github.com/sindresorhus/ip-regex/blob/main/index.js

let v6segment = '[a-fA-F\\d]{1,4}';

export let ipv6 = toRegExp(
  `(?:` +
    // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
    `(?:${v6segment}:){7}(?:${v6segment}|:)|` +
    // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
    `(?:${v6segment}:){6}(?:${ipv4}|:${v6segment}|:)|` +
    // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
    `(?:${v6segment}:){5}(?::${ipv4}|(?::${v6segment}){1,2}|:)| ` +
    // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
    `(?:${v6segment}:){4}(?:(?::${v6segment}){0,1}:${ipv4}|(?::${v6segment}){1,3}|:)| ` +
    // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
    `(?:${v6segment}:){3}(?:(?::${v6segment}){0,2}:${ipv4}|(?::${v6segment}){1,4}|:)|` +
    // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
    `(?:${v6segment}:){2}(?:(?::${v6segment}){0,3}:${ipv4}|(?::${v6segment}){1,5}|:)|` +
    // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
    `(?:${v6segment}:){1}(?:(?::${v6segment}){0,4}:${ipv4}|(?::${v6segment}){1,6}|:)|` +
    // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
    `(?::(?:(?::${v6segment}){0,5}:${ipv4}|(?::${v6segment}){1,7}|:))` +
    // %eth0  %1
    `)(?:%[0-9a-zA-Z]{1,})?`,
  { removeComments: false },
);

/**
 * matches ip v4 or v6
 * in nodejs use the built in net.isIP(ip), net.isIPv4(ip) and net.isIPv6(ip).
 * https://nodejs.org/api/net.html#netisipv6input
 */

export let ip = toRegExp([ipv4, ipv6], { delimiter: '|' });

/**
 * validates the top-level domain without the sub-domain
 * starts with alphanumeric then (alphanumeric, -) then '.' then an extension then another optional sub-extension
 * domainNam.length <= 63
 * capture groups:
 *  - top-level domain
 *  - extension
 *  - sub-extension (optional)
 * to add flags use toRegExp()
 *
 * @example
 *  abc123-def.com.us -> (abc123-def).(com).(us)
 *  _abc123.com -> invalid
 *  abc@def.com -> invalid
 */
export let rootDomain =
  /^([\dA-Za-z][\dA-Za-z-]{2,62})\.(\w{2,3})(?:\.([A-Za-z]{2}))?$/;

/**
 * validates a full domain including zero or more subdomains
 * each part is a valid domain without the extension part, and can be only one character
 *
 * captures the subdomains as a single string and the same parts of the rootDomain patters
 *
 * @example
 * aa.bb.cc.domain.com.us -> (aa.bb.cc.)(domain).(com).(eg)
 *
 * todo: remove the trailing '.' of the subdomain
 */
// http://sqa.fyicenter.com/1000207_Domain_Name_Validator.html
// https://stackoverflow.com/a/13155066/12577650
export let domain = toRegExp(
  [
    // subdomain
    // todo: RegExp captures the latest group match only, instead of capturing all of the repeating patterns
    // https://stackoverflow.com/a/37004214/12577650
    /^((?:([\dA-Za-z][\dA-Za-z-]{0,62})+\.)*)/,
    // remove the first '^' from '^---' or '(?:^---)'
    rootDomain.source.replace('^', ''),
  ],
  { delimiter: '' },
);

/**
 * starts with [a-z] then alphanumeric character then '@' sign then a domain pattern
 * capture groups:
 *  - username
 *  - domain
 *  - extension
 *  - sub-extension
 *
 * @example
 * abc123@gmail.com.us -> (abc123)@(gmail).(com).(us)
 * _abc@gmail.com -> invalid (doesn't start with a letter)
 * abc.d.e -> invalid (not an email format)
 */
export let email = toRegExp([/^([a-z]+\w+)@/, domain.source.replace('^', '')], {
  delimiter: '',
});

// https://stackoverflow.com/a/41353282/12577650
let allowedChars = `A-Za-z0-9-_.~:/?#[\\]@!$&'()*+,;=`;
let tdl = 'com|net|org';

export let link = toRegExp(
  `(` +
    // starts with a protocol then allowedChars
    // todo: replace with domain pattern
    `(?:ftps?|https?:\\/\\/[${allowedChars}]+)` +
    // or ends with a known tdl and an optional country code
    // examples: domain.com, domain.com.eg
    // todo: replace with domain pattern
    `|(?:[${allowedChars.replace(
      '/',
      '',
    )}]+\\.(?:${tdl})(?:\\.[a-z]{2}){0,1})` +
    `)` +
    // optional port number
    // example: https://host:port/
    `(?::\d+)?` +
    // optional path
    `(?:\\/[${escape(allowedChars)}]+)*`,
  { flags: 'gi' },
);

/**
 * a plain text link, i.e doesn't exist inside <a> tag (not hypernated)
 */
export let plainLink = toRegExp(
  [
    // at the beginning of the line
    // or prefixed by a space or line break, i.e. not inside "" or ''
    // todo: this matched `" link"`
    // todo: doesn't match `<p>link</p>`
    '^|\\s',
    link,
  ],
  { delimiter: '' },
);

export interface PasswordOptions extends ToRegExpOptions {
  minLength?: number;
  maxLength?: number;
  minNumbers?: number;
  minSpecialChars?: number;
  // accepts RegExp ranges, example: 'a-zA-Z', default: 'a-zA-Z0-9!@#$%^&*'
  allowedChars?: string;
}
/**
 *
 * @param options
 */
export function strongPassword(options: PasswordOptions = {}) {
  let opts: PasswordOptions = {
    minLength: 6,
    maxLength: 50,
    minNumbers: 1,
    minSpecialChars: 1,
    allowedChars: 'a-zA-Z0-9!@#$%^&*',
    escape: false,
    trim: true,
    removeComments: true,
    ...options,
  };
  return toRegExp(
    `
  ^
  // must contain a number
  ${opts.minSpecialChars! > 0 ? `(?=.*[0-9]{${opts.minSpecialChars},})` : ''}
  // must contain a special character
  ${
    opts.minSpecialChars! > 0
      ? `(?=.*[!@#$%^&*]{${opts.minSpecialChars},})`
      : ''
  }
  // contains allowed characters
  [${opts.allowedChars}]{${opts.minLength},${opts.maxLength}}
  $  
  `,
    opts,
  );
}
export interface PhoneOptions extends ToRegExpOptions {
  forceCountryCode?: boolean;
  // matches: 123-456-7890
  // a characters series or an array of characters
  // example: '-._/'
  // default: '-'
  allowedSeparators?: string | null;
  // example: (123)456-7890
  allowBraces?: boolean;
  allowedChars?: string;
  // default: 6
  // the length of the digits only, including the country code
  // and excluding the separators, braces and the leading sign (i.e. + and 00)
  minLength?: number;
  // default: 15
  maxLength?: number;
}
/**
 *
 * @param options
 */
// todo: capture the country code
export function phone(options?: PhoneOptions) {
  let opts: PhoneOptions = {
    forceCountryCode: false,
    // the total length of the whole value, including the leading sign, separators, braces and the country code
    // todo: remove non-number characters and the country code from counting
    minLength: 6,
    maxLength: 15,
    allowBraces: true,
    allowedSeparators: '-',
    removeComments: true,
    ...options,
  };

  opts.allowedChars = `\\d${opts.allowedChars || ''}`;

  let separatorPattern =
    opts.allowedSeparators && opts.allowedSeparators.length > 0
      ? `[${escape(opts.allowedSeparators)}]?`
      : '';

  return toRegExp(
    `^` +
      // positive lookahead for the length of the whole value
      // https://stackoverflow.com/a/52009276/12577650
      `(?=.{${opts.minLength},${opts.maxLength}}$)` +
      // the country code part, followed by an optional separator
      // may be grouped inside braces in some countries
      // starts '+' or '00'
      // optional if !opts.forceCountryCode
      // todo: capture the country code
      `(?:` +
      // the leading sign
      `(?:\\+|00)` +
      // the country code, is 1-3 digit and may be grouped inside braces
      `${opts.allowBraces ? '(?:\\([0-9]{1,3}\\)|[0-9]{1,3})' : '[0-9]{1,3}'}` +
      `${separatorPattern}` +
      `)${opts.forceCountryCode ? '' : '?'}` +
      // group each 3 digits inside braces, then an optional separator
      `${opts.allowBraces ? '(?:\\([0-9]{3}\\)|[0-9]{3})' : '[0-9]{3}'}` +
      // optionally use an allowed separator between groups
      `${
        separatorPattern.length > 0
          ? separatorPattern + '[0-9]{3}' + separatorPattern + '[0-9]+'
          : '[0-9]+'
      }` +
      // remove the groups that already counted before the last optional separator
      // including the country code without the leading sign
      // and an extra 3 digits in case of separators allowed
      `$`,
  );
}

export interface NameOptions {
  // accepts ranges such as [a-z]
  // default: a-zA-Z
  allowedChars?: string;
  minLength?: number;
  maxLength?: number;
  // in some languages, the name may be consists of two parts
  // default: true
  allowParts?: boolean;
}

/**
 *
 * @param options
 */
export function name(options?: NameOptions) {
  let opts: NameOptions = {
    allowedChars: 'a-zA-Z',
    minLength: 2,
    maxLength: 20,
    allowParts: true,
    ...options,
  };
  return toRegExp(
    `
  ^
  // see phone pattern
  (?=.{${opts.minLength},${opts.maxLength}}$)
  [${opts.allowedChars}]+
  ${opts.allowParts ? '(?:[ ' + opts.allowedChars + '])+?' : ''}
  $
  `,
    { trim: true, escape: false, removeComments: true },
  );
}

export interface HashtagOptions {
  allowedChars?: string;
  minLength?: number;
  maxLength?: number;
}

export function hashtagPattern(options: HashtagOptions = {}) {
  let opts: HashtagOptions = {
    allowedChars: `${unicodeRanges.any}_`,
    minLength: 0,
    maxLength: 100,
    ...options,
  };
  return toRegExp(
    // at the beginning of the string or after a white space
    `(?:^|\\s)` +
      // starts with '#' followed by opts.allowedChars
      `(#[${opts.allowedChars}]{${opts.minLength || 0},${
        opts.maxLength || ''
      }})`,
    { flags: 'u' },
  );
}

/**
 * use to parse a req/res header value
 * values may be separated by "," and may be surrounded by double quotations
 * the key is group[0], `value is group[1] || group[2]` of each match
 * @example req.headers['cache-control'].matchAll(headerPattern)
 */
// todo: refactor other patterns to accept the argument optionsOrFlags
export let headerPattern = (optionsOrFlags?: ToRegExpOptions | string) =>
  toRegExp(
    // the key starts with a letter and may contains "-" or "_" and followed by an optional space
    `([a-zA-Z][a-zA-Z_-]*)\\s*` +
      // the value is optional, and separated from the key by "="
      `(?:=` +
      // the value may be surrounded by  double quotations
      `(?:"([^"]*)"` +
      // or without quotations, until if finds the first space or "," or ";"
      `|([^ \t",;]*)` +
      `))?`,
    optionsOrFlags,
  );
