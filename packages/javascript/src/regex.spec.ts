import { describe, expect, jest, test } from '@jest/globals';
import { escape, mergePatterns, toFilter, toRegExp } from './regex';

test('escape', () => {
  expect(escape('a[bc{d}[e]f')).toEqual('a\\[bc\\{d\\}\\[e\\]f');
});

test('toRegExp', () => {
  expect(toRegExp('x')).toEqual(/x/);
  expect(toRegExp('x[y]')).toEqual(/x[y]/);
  expect(toRegExp(['x', 'y'])).toEqual(/(?:x)(?:y)/);
  expect(toRegExp(['x', 'y'], { delimiter: '|' })).toEqual(/(?:x)|(?:y)/);
});

test('toFilter: string', () => {
  expect(toFilter('x')).toEqual(expect.any(Function));
  expect(toFilter('x')('x')).toEqual(true);
  expect(toFilter('x')('y')).toEqual(false);
});

test('toFilter: regex', () => {
  expect(toFilter(/x/)).toEqual(expect.any(Function));
  expect(toFilter(/x/)('x')).toEqual(true);
  expect(toFilter(/x/)('y')).toEqual(false);
});

test('toFilter: Array<string>', () => {
  // returns (value)=>/(?:x)(?:y)/.test(value)
  expect(toFilter(['x', 'y'])).toEqual(expect.any(Function));
  expect(toFilter(['x', 'y'])('xy')).toEqual(true);
  expect(toFilter(['x', 'y?'])('x')).toEqual(true);
  expect(toFilter(['x', 'y'])('x')).toEqual(false);
  expect(toFilter(['x', 'y'])('z')).toEqual(false);
  expect(toFilter(['x'])('xy')).toEqual(true);
});

test('mergePatterns', () => {
  expect(toRegExp([/a/, '^b$', /^c$/])).toEqual(/(?:a)(?:^b$)(?:^c$)/);
  expect(toRegExp([/a/, '^b$', /^c$/], { delimiter: '|' })).toEqual(
    /(?:a)|(?:^b$)|(?:^c$)/
  );
});
