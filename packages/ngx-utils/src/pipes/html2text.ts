import { Inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { replaceRecursive } from '@engineers/javascript';
import Nl2brPipe from './nl2br';
import { DOCUMENT } from '@angular/common';

export interface Html2textOptions {
  // whether to use <br /> or '\n' line breaks
  // use '\n' to save the text into a file, and use '<br />' to display the text in a web page.
  // also all block tags like <p>, <h1> will be converted into the specified line break format
  nl2br?: boolean;
  /**
   * link format replacement, use [text] and [href]
   * it should be the same as the second parameter of String.replace(), in addition to [text] and [href]
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
   * @example to convert links into md format : `[[text]]([href])`
   */
  linksFormat?: string;
  /** whether to use .transformElement() method instead of Regexp */
  useTransformElement?: boolean;
}

@Pipe({
  name: 'html2text',
  standalone: true,
})
export default class Html2textPipe implements PipeTransform {
  constructor(@Inject(DOCUMENT) private document: Document) {}
  /**
   * converts an html code into a plain text,
   * keeping some allowed tags, or converts it into another format
   * for example: you can keep links <a> or convert it into the markdown format, i.e. `[text](link)`
   *
   * @param value an html string to be converted into a plain text string
   * @param options
   * @returns
   */
  // todo: use a transformer function to convert html nodes into another format
  // todo: filter(el=>(boolean=false))
  // todo: use htmlTransform(value, transform(match)=>newValue)
  // example  html2text= htmlTransform(value, (match)=>{if(match[1]==='h1')return '<h2>$2</h2>'})
  // todo: use jsdom (or <template>) to generate an HTMLElement and pass it to transformElement
  // add opts.transformElement=true to use DOM instead of regex
  transform(value?: string, options: Html2textOptions = {}): string {
    if (!value) return '';
    if (options.useTransformElement !== false) {
      // todo: use <template>
      let div = this.document.createElement('div');
      // eslint-disable-next-line @microsoft/sdl/no-inner-html
      div.innerHTML = value.trim();
      return this.transformElement(<Element>div, options);
    }

    /**
     * matches: <div> (<b>inner element</b>) </div>
     * group 1: the outer tag, i.e. 'div'
     * group 2: the nested element, i.e. '<b>inner element</b>'
     * group 3: the nested element's tag, i.e. 'b'
     *
     */
    // todo: this is too match slow
    let nestedElements =
        /<([^\s>]+)\s?.*?>.*(<([^\s>]+)\s?.*?>.*<\/\3>).*<\/\1>/gi,
      matches = value.matchAll(nestedElements);

    [...matches].map((match) => {
      value = value?.replace(match[2], this.transform(match[2]));
    });

    let opts: Html2textOptions = { linksFormat: '[text] [href]', ...options };

    if (typeof opts.linksFormat === 'string') {
      opts.linksFormat = opts.linksFormat
        .replace('[text]', '$3')
        .replace('[href]', '$2');
    }

    // pattern: /<(tag).*>(content)</tag>/
    // matches <p> and <p .*>, but not <pxxx>
    // todo: get all html block tags
    let blockTags =
        /(?:<(div|p|li|section|article|blockquote)(?:\s.+>|>)(.+)<\/\1>)+?/gm,
      headerTags = /(?:<(h[1-6])(?:\s.+>|>)(.+)<\/\1>)+?/gm;

    value = value
      // remove all line breaks (except <br />) as they are ignored by html parsers
      .replaceAll(/\r\n|\n\r|\r|\n/g, '')
      // convert <br> and <hr> into line breaks
      .replaceAll(/<(br|hr)\s*\/?>/g, '\r')
      .replaceAll(blockTags, '\n$2\n')
      .replaceAll(headerTags, '\n# $2:\n\n')
      // convert links into the specified format
      .replaceAll(/<a .*href=(["'])(.*?)\1.*>(.*?)<\/a>/gi, opts.linksFormat!)
      // remove inline <style>, <script>, <meta> blocks
      // matches <script>....</script>
      .replaceAll(/<(style|script|meta).*?>.*<\/\1>/g, '')
      // matches <script src="..." />
      .replaceAll(/<(style|script|meta).*?\s*\/>/g, '')
      // strip html(except <br> if lineBreak=br)
      // or: /<(?:.|\s)*?>/
      .replaceAll(/<[^>]+>/g, '')
      // remove repeating spaces and line breaks
      .replaceAll(/(\s)+/g, '$1');

    if (opts.nl2br) {
      value = new Nl2brPipe().transform(value);
      // remove repeating line breaks
      // matches `<br>  <br>` and `<br>\n</br>
      value = replaceRecursive(value, /(<br[^>]*>[\n ]?)+/g, '<br />');
    }
    return value;
  }

  /**
   * same as transform() but accepts HTMLElement
   * and uses Dom Element instead of Regexp
   * it is much faster for nested elements
   * @param element
   * @returns
   */
  // todo: preserve line breaks in <pre>
  // todo: add `map(el:Element,tagName,textContent)=>string` to customize the result for each element
  transformElement(
    element: Element | Element[] | NodeList | ChildNode[],
    options: Html2textOptions = {},
  ): string {
    let opts: Html2textOptions = {
      linksFormat: '[text] ( [href] )',
      ...options,
    };

    if (Array.isArray(element) || element instanceof NodeList)
      return (
        [...element]
          .map((el) => this.transformElement(<Element>el, opts))
          .join('')
          // limit repeating spaces and line breaks to 2
          // todo: opts.maxRepeatingSpaces
          .replaceAll(/(\s){3,}/g, '$1$1')
      );

    let tagName = element.tagName?.toLowerCase();

    // text node
    if (!tagName) return element.textContent || '';

    if (
      // a comment node
      element.nodeType === 8 ||
      ['style', 'script', 'meta', 'button'].includes(tagName.toLowerCase())
    )
      return '';

    if (tagName === 'li')
      return `- ${this.transformElement(element.childNodes, opts)}\n`;

    // heading elements
    if (/^h[1-6]/.test(tagName))
      return `# ${this.transformElement(element.childNodes, opts)}:\n\n`;

    // block elements
    if (
      ['p', 'div', 'section', 'article', 'blockquote'].includes(tagName)
      // todo: `getComputedStyle` is not defined in SSR, use domino
      // https://medium.com/motf-creations/angular-universal-referenceerror-window-is-not-defined-f0ed140e3210
      // || getComputedStyle(element).display === 'block'
    )
      return `\n${this.transformElement(element.childNodes, opts)}\n`;

    // todo: or replace <hr> with "\n=========\n"
    // or opts.hr
    if (['br', 'hr'].includes(tagName)) return '\n';

    if (tagName === 'a') {
      let href = element.getAttribute('href'),
        text = this.transformElement(element.childNodes, opts);
      // example: <a href="google.com">google.com</a>
      if (text.toLowerCase() === 'asp.net' || text === href) return text;
      return (
        opts.linksFormat
          ?.replace('[text]', text)
          .replace('[href]', element.getAttribute('href') || '') || text
      );
    }

    if (tagName === 'code')
      return (
        '```\n' + this.transformElement(element.childNodes, opts) + '```\n'
      );

    // .children ignores text and comments,
    // .childNodes return all nodes including text and comments
    if (!element.children?.length) {
      return (
        (element.textContent || '')
          // ignore CR/LF breaks as they are ignored by html parsers
          // todo: except inside <pre>
          .replaceAll(/[\r\n]/g, '')
          .trim()
      );
    }

    return this.transformElement(element.childNodes, opts);
  }
}
