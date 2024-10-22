import { describe, expect, test } from '@jest/globals';
import { isEmpty } from './validations';

describe('isEmpty', () => {
  test('undefined & null', () => {
    expect(isEmpty()).toBeTruthy();
    expect(isEmpty(null)).toBeTruthy();
  });

  test('string', () => {
    expect(isEmpty('')).toBeTruthy();
    expect(isEmpty('  ')).toBeTruthy();
    expect(isEmpty('  ', { trim: false })).toBeFalsy();
    expect(isEmpty('ok')).toBeFalsy();
  });

  test('number', () => {
    expect(isEmpty(0)).toBeTruthy();
    expect(isEmpty(0, { allowZero: true })).toBeFalsy();
    expect(isEmpty(1)).toBeFalsy();
  });

  test('array', () => {
    expect(isEmpty([])).toBeTruthy();
    expect(isEmpty([1])).toBeFalsy();
  });

  test('object', () => {
    expect(isEmpty({})).toBeTruthy();
    expect(isEmpty({ ok: true })).toBeFalsy();
  });
});
