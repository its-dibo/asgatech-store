import { expect, test } from '@jest/globals';
import Html2textPipe from './html2text';

test('html2text', () => {
  let value = `<h2>heading</h2><p>paragraph1</p><p>paragraph2</p><a href='https://google.com'>link text</a><br />text`;

  expect(new Html2textPipe().transform(value)).toEqual(
    `\nheading\n\nparagraph1\n\nparagraph2\nlink text https://google.com\ntext`,
  );

  /* todo: jest removes <br />
    expect(html2text(value, { nl2br: true })).toEqual(
      `<br />heading<br /><br />paragraph1<br /><br />paragraph2<br />link text https://google.com<br />text`
    );
    */
});
