import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nl2br',
  standalone: true,
})
export default class Nl2brPipe implements PipeTransform {
  /**
   * converts line breaks `\n\r` into `<br />`
   *
   * @param value
   * @returns
   */
  transform(value: string): string {
    return value.replace(/\r\n|\n\r|\r|\n/g, '<br />');
  }
}
