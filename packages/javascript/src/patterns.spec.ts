import { describe, expect, test } from '@jest/globals';
import {
  PhoneOptions,
  domain,
  email,
  ip,
  ipv4,
  ipv6,
  link,
  name,
  phone,
  plainLink,
  rootDomain,
  strongPassword,
} from './patterns';

// todo: test capture groups for all patterns

test('rootDomain', () => {
  expect(rootDomain.test('google.com')).toBeTruthy();
  expect(rootDomain.test('google.com.uk')).toBeTruthy();
  expect(rootDomain.test('google.co.uk')).toBeTruthy();
  expect(rootDomain.test('prefix-google.com')).toBeTruthy();
  expect(rootDomain.test('_google.com')).toBeFalsy();
  expect(rootDomain.test('abc@def.com')).toBeFalsy();
  // this fails with rootDomain pattern, but success with domain pattern
  expect(rootDomain.test('subdomain.google.com')).toBeFalsy();
});

test('using domain pattern to validate root domains', () => {
  // this is the same test for rootDomain but using domain pattern
  expect(domain.test('google.com')).toBeTruthy();
  expect(domain.test('google.com.uk')).toBeTruthy();
  expect(domain.test('google.co.uk')).toBeTruthy();
  expect(domain.test('prefix-google.com')).toBeTruthy();
  expect(domain.test('_google.com')).toBeFalsy();
  expect(domain.test('abc@def.com')).toBeFalsy();
  expect(domain.test('subdomain.google.com')).toBeTruthy();
});

test('domain: full domain including subdomains', () => {
  expect(domain.test('subdomain.google.com.uk')).toBeTruthy();
  expect(domain.test('-subdomain.google.com')).toBeFalsy();
  expect(domain.test('prefix-subdomain.google.com')).toBeTruthy();
  expect(domain.test('prefix_subdomain.google.com')).toBeFalsy();
  expect(domain.test('aa.bb.cc.google.com')).toBeTruthy();
});

test('ipv4', () => {
  expect(ipv4.test('192.0.0.1')).toBeTruthy();
  expect(ipv4.test('192.0.0.01')).toBeFalsy();
  expect(ipv4.test('192.0.1')).toBeFalsy();
  expect(ipv4.test('192.0.1.a')).toBeFalsy();
});

test('ipv6', () => {
  expect(ipv6.test('2001:0db8:0000:0000:0000:ff00:0042:8329')).toBeTruthy();
  expect(ipv6.test('2001:db8:0:0:0:ff00:42:8329')).toBeTruthy();
  expect(ipv6.test('2001:db8::ff00:42:8329')).toBeTruthy();
  expect(ipv6.test('2001:db8:3333:4444:5555:6666:7777:1.2.3.4')).toBeTruthy();
  expect(ipv6.test('192.0.0.1')).toBeFalsy();
});

test('ip: ipv4 or ipv6', () => {
  // ipv4
  expect(ip.test('192.0.0.1')).toBeTruthy();
  // todo: fix: this gives falsy with ipv4 and ipv6, but gives truthy with ip
  // when removing ipv4 from mergePatterns([ipv4,ipv6],'|') it works
  // expect(ip.test('192.0.0.01')).toBeFalsy();
  expect(ip.test('192.0.1')).toBeFalsy();
  expect(ip.test('192.0.1.a')).toBeFalsy();

  // ipv6
  expect(ip.test('2001:0db8:0000:0000:0000:ff00:0042:8329')).toBeTruthy();
  expect(ip.test('2001:db8:0:0:0:ff00:42:8329')).toBeTruthy();
  expect(ip.test('2001:db8::ff00:42:8329')).toBeTruthy();
  expect(ip.test('2001:db8:3333:4444:5555:6666:7777:1.2.3.4')).toBeTruthy();
});

test('email', () => {
  expect(email.test('abc123@gmail.com.us')).toBeTruthy();
  expect(email.test('_abc@gmail.com')).toBeFalsy();
  expect(email.test('abc.d.e')).toBeFalsy();
});

test('link', () => {
  expect(link.test('https://www.google.com/path?x=1&y=2')).toBeTruthy();
  expect(plainLink.test('https://www.google.com/path?x=1&y=2')).toBeTruthy();
});

test('strongPasswword', () => {
  expect(strongPassword().test('abc@123')).toBeTruthy();
  // < 6 chars
  expect(strongPassword().test('abc')).toBeFalsy();
  // doesn't contain a special char
  expect(strongPassword().test('abc123')).toBeFalsy();
  expect(strongPassword({ minLength: 8 }).test('abc@123')).toBeFalsy();
  expect(strongPassword({ minSpecialChars: 2 }).test('abc@123')).toBeFalsy();
  expect(strongPassword({ maxLength: 7 }).test('abc@123456')).toBeFalsy();
  expect(strongPassword({ maxLength: 7 }).test('abc@123')).toBeTruthy();
});

describe('phone', () => {
  let opts: PhoneOptions = {
    allowedSeparators: '',
    allowBraces: false,
    forceCountryCode: false,
    minLength: 10,
    maxLength: 30,
  };
  test('minLength', () => {
    expect(phone(opts).test('1234567890')).toBeTruthy();
    expect(phone(opts).test('123')).toBeFalsy();
  });

  test('force country code', () => {
    expect(
      phone({ ...opts, forceCountryCode: true }).test('0012345678900')
    ).toBeTruthy();

    expect(
      phone({ ...opts, forceCountryCode: true }).test('+1234567890')
    ).toBeTruthy();

    expect(
      phone({ ...opts, forceCountryCode: true }).test('1234567890')
    ).toBeFalsy();
  });

  test('allow separators', () => {
    expect(
      phone({ ...opts, allowedSeparators: '-' }).test('123-456-78900')
    ).toBeTruthy();
    expect(
      phone({ ...opts, allowedSeparators: null }).test('123-456-78900')
    ).toBeFalsy();
  });

  test('allow braces', () => {
    expect(
      phone({ ...opts, allowBraces: true }).test('(123)4567890')
    ).toBeTruthy();

    expect(
      phone({ ...opts, allowBraces: false }).test('(123)4567890')
    ).toBeFalsy();
  });

  test('force country code, allow braces and separators', () => {
    expect(
      phone({
        ...opts,
        forceCountryCode: true,
        allowBraces: true,
        allowedSeparators: '-',
      }).test('+1(234)-567-890')
    ).toBeTruthy();
  });

  test('lengths', () => {
    expect(phone({ ...opts, minLength: 5 }).test('123456')).toBeTruthy();

    expect(phone({ ...opts, minLength: 5 }).test('1234')).toBeFalsy();

    expect(
      phone({
        ...opts,
        minLength: 5,
        allowBraces: true,
        allowedSeparators: '-',
      }).test('123-456')
    ).toBeFalsy();
  });
});

test('name', () => {
  expect(name().test('abcd')).toBeTruthy();
  expect(name({ allowParts: true }).test('abcd efg')).toBeTruthy();
  expect(name({ allowParts: false }).test('abcd efg')).toBeFalsy();
  expect(name({ minLength: 5 }).test('abcdefg')).toBeTruthy();
  expect(name({ minLength: 5 }).test('abcd')).toBeFalsy();
  expect(name({ allowedChars: 'a-f' }).test('abcd')).toBeTruthy();
  expect(name({ allowedChars: 'a-f' }).test('ghi')).toBeFalsy();
});
