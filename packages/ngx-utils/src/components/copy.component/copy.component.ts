import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
} from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@engineers/rxjs';
import { copy } from '@engineers/javascript';

export type Async<T> = T | Promise<T> | Observable<T>;

@Component({
  selector: 'copy',
  templateUrl: './copy.component.html',
  styleUrls: ['./copy.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
/**
 * generate a copy button that copies some data to the clipboard
 */
export class CopyComponent {
  // a function that accepts the current element i.e. the copy button,
  // and returns the data to be copied
  @Input() getData: (element: HTMLElement) => Async<string>;
  @Input() icon = 'content_copy';
  @Input() tooltip: string;
  // triggered after the data is copied to the clipboard
  // emits the data or an Error
  @Output() afterCopied = new EventEmitter<string | Error>();

  constructor(private elementRef: ElementRef) {}
  ngOnInit(): void {}

  copy() {
    toObservable<string>(this.getData(this.elementRef.nativeElement)).subscribe(
      {
        next: (data) =>
          copy(data)
            .then(
              // todo: add a tooltip `copied!` to the copy button
              () => this.afterCopied.emit(data)
            )
            .catch((error: any) => this.afterCopied.emit(new Error(error))),
        error: (err) => console.error(err),
      }
    );
  }
}
