import { DOCUMENT } from '@angular/common';
import { Inject, Pipe, PipeTransform } from '@angular/core';
import { email, plainLink } from '@engineers/javascript';

export interface Attributes {
  [key: string]: string;
}

@Pipe({ name: 'hypernate', standalone: true })
export default class HypernatePipe implements PipeTransform {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  /**
   * hypernate links
   * i.e. convert plain links into html anchors
   * emails are prefixed with `mailto:`
   *
   * @example google.com -> `<a href="google.com">google.com</a>
   * @exaple email@gmail.com -> `<a href="mailto:email@gmail.com">email@gmail.com</a>
   */
  transform(value?: string, attributes: Attributes = {}): string {
    if (!value) return '';
    let div = this.document.createElement('div');
    // eslint-disable-next-line @microsoft/sdl/no-inner-html
    div.innerHTML = value.trim();
    return [...div.childNodes]
      .map((el) => {
        let element = this.transformElement(<Element>el, attributes);
        // textElement.outerHTML is undefined
        return element.outerHTML || element.textContent;
      })
      .join('');
  }

  /**
   * see Html2text.transformElement()
   */
  transformElement(element: Element, attributes: Attributes = {}): Element {
    let tag = element.tagName?.toLowerCase();
    if (
      element.nodeType === 8 ||
      ['style', 'script', 'meta', 'button'].includes(tag)
    )
      return element;

    if (tag === 'a') {
      element.setAttribute('target', '_blank');
      return element;
    }

    if (!element.children?.length) {
      let attr = Object.keys(attributes)
        .map((key) => ` ${key}="${attributes[key]}"`)
        .join('');

      // eslint-disable-next-line @microsoft/sdl/no-inner-html
      element.innerHTML = element.innerHTML?.replaceAll(
        new RegExp(plainLink, 'gi'),
        (match) =>
          match.toLowerCase() === 'asp.net'
            ? match
            : `<a href="${
                email.test(match) ? 'mailto:' : ''
              }${match}"${attr}>${match}</a>`,
      );
      return element;
    }

    [...element.childNodes].map((el) => this.transformElement(<HTMLElement>el));
    return element;
  }
}
