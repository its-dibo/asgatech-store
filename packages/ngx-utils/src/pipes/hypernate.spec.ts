import { expect, test } from '@jest/globals';
import HypernatePipe from './hypernate';

test('hypernate', () => {
  let value = `text https://example.com/files<br />example.com.eg <a href="example.com">example.com</a>example.com`;

  expect(new HypernatePipe().transform(value)).toEqual(
    `text <a href="https://example.com/files">https://example.com/files</a><br /><a href="example.com.eg">example.com.eg</a> <a href="example.com">example.com</a><a href="example.com">example.com</a>`
  );
});
