import { Pipe, PipeTransform } from '@angular/core';
import LengthPipe from './length';

export interface SlugOptions {
  // the maximum output length of the slug, default: 200.
  length?: number;
  // a regexp of allowed characters and language codes, separated by '|'.
  allowedChars?: string;
  encode?: boolean;
}

@Pipe({
  name: 'slug',
  standalone: true,
})
export default class SlugPipe implements PipeTransform {
  /**
   * creates a url-friendly slug from a text (a content title)
   * i.e: replaces the white spaces, removes the unwanted characters
   * and limits the slug to the specified length
   *
   * @function slug
   * @param  value the text to be converted into slug.
   * @param options
   * @returns
   */
  transform(value: string, options: SlugOptions = {}): string {
    let langs = {
      ar: 'أابتثجحخدذرزسشصضطظعغفقكلمنهويىآئءلألإإآة',
    };

    let opts = {
      length: 200,
      allowedChars: '',
      encode: true,
      ...options,
    };

    opts.allowedChars = opts.allowedChars
      .split('|')
      .map((element) =>
        element.startsWith(':')
          ? langs[element.slice(1) as keyof typeof langs]
          : element
      )
      .join('');

    let _slug = value
      // remove the trailing spaces
      .trim()
      // remove any unallowed characters
      .replace(new RegExp(`[^a-z0-9-._~${opts.allowedChars}]`, 'gi'), '-')
      // replace the inner spaces with '-'
      .replace(/\s+/g, '-')
      // remove sequential slashes
      .replace(/-{2,}/g, '-')
      // remove the trailing slashes at the beginning or the end.
      .replace(/^-+|-+$/g, '');

    return new LengthPipe().transform(
      opts.encode ? encodeURIComponent(_slug) : _slug,
      opts.length
    );
  }
}
