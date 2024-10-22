import { Pipe, PipeTransform } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  ɵDomSanitizerImpl,
} from '@angular/platform-browser';

@Pipe({ name: 'keepHtml', pure: false, standalone: true })
export default class KeepHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * bypasses Angular sanitizer and prevents Angular from sanitizing the html value,
   * https://angular.io/guide/security#xss
   * don't do: <p>{{content | keepHtml}}</p> -> error: SafeValue must use [property]=binding
   * do: <p [innerHTML]='content | keepHtml'></p>
   * https://stackoverflow.com/a/58618481
   * https://medium.com/@AAlakkad/angular-2-display-html-without-sanitizing-filtering-17499024b079
   *
   * @function keepHtml
   * @param  value  the trusted value to be bypassed
   * @param  sanitizer the injected DomSanitizer
   * @returns SafeHTML, the bypassed html value.
   * @example <div [innerHTML]="htmlContent | keepContent"></div>
   */

  transform(value: string): SafeHtml {
    // todo: pass sanitizer or document
    if (!this.sanitizer) {
      this.sanitizer = new ɵDomSanitizerImpl(document);
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
