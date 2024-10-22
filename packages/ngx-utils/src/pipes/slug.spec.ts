import { expect, test } from '@jest/globals';
import SlugPipe from './slug';

test('slug', () => {
  let slug = new SlugPipe();
  let value = 'a b/c-d&e 123--';
  expect(slug.transform(value)).toEqual('a-b-c-d-e-123');
  expect(slug.transform(value, { length: 3 })).toEqual('a-b');
  expect(slug.transform(value, { allowedChars: '&', encode: false })).toEqual(
    'a-b-c-d&e-123'
  );
  expect(slug.transform(value, { allowedChars: '&', encode: true })).toEqual(
    'a-b-c-d%26e-123'
  );
});
