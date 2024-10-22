import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[ngxAttributes]',
  standalone: true,
})
/**
 * add arbitrary attributes to any element
 */
export class AttributesDirective {
  @Input() ngxAttributes?: { [key: string]: any };
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    for (let key in this.ngxAttributes) {
      // todo: use renderer2
      // todo: support nested keys i.e. style.backgroundColor
      // todo: add arbitrary events
      this.el.nativeElement.setAttribute(key, this.ngxAttributes[key]);
    }
  }
}
