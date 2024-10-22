import { Pipe, PipeTransform } from '@angular/core';

/**
 * cuts a part of a string into the specified length, starting from `start` value
 */
@Pipe({
  name: 'length',
  standalone: true,
})
export default class LengthPipe implements PipeTransform {
  transform(value: string, _length?: number, start = 0): string {
    return _length && value ? value.slice(start, _length + start) : value;
  }
}
