import { expect, test } from '@jest/globals';
import LengthPipe from './length';

test('length', () => {
  let value = 'abcdefghi',
    length = new LengthPipe();
  expect(length.transform(value)).toEqual(value);
  expect(length.transform(value, 3)).toEqual('abc');
  expect(length.transform(value, 3, 2)).toEqual('cde');
});
