import { expect, test } from '@jest/globals';
import Nl2brPipe from './nl2br';

test('nl2br', () => {
  let value = 'a<br>b<br />c\nd\re\n\rf';
  expect(new Nl2brPipe().transform(value)).toEqual(
    'a<br>b<br />c<br />d<br />e<br />f'
  );
});
