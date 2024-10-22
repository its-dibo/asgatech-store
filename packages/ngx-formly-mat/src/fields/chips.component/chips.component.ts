import { Component, ElementRef, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatInputModule } from '@angular/material/input';
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@engineers/rxjs';
import { AutoCompleteItem } from '../autocomplete.component/autocomplete.component';

export interface EventRes {
  eventType: EventType;
  value?: any;
}
export type EventType = 'clear';

/**
 * an input that accepts chips and supports autocomplete
 * each item can be removed or edited
 *
 * props:
 *   - items {string[]} a list of pre entered chip items 
 *   - autoComplete {(value: string, items: string[], autoCompleteList:string[])=> string[]}
 *       a function that receives the current input's value, the current data items, and the current autoComplete list 
 *       then returns a new list of suggested items
 *   - placeholder {string} a placeholder that displayed in the input field 
 *   - events: Observable<EventRes>: receive events from the parent component

 */
@Component({
  selector: 'formly-chips-mat',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormlyModule,
    FormlyMaterialModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    AsyncPipe,
  ],
  templateUrl: './chips.component.html',
})
export class FormlyChipsMatComponent extends FieldType<FieldTypeConfig> {
  // chips items, i.e. input value
  // to set initial items, use `field.defaultValue: []`
  items: string[];
  // suggested items, see ./input-autocomplete
  autoCompleteList: AutoCompleteItem[];
  // todo: issue: when selecting an option from autoCompleteList,
  // the search term is added too when `addOnBlur` is true
  // https://github.com/angular/components/issues/13574#issuecomment-1247988216
  // https://github.com/angular/components/issues/19279#issuecomment-627263513
  addOnBlur = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    let items = this.formControl.value || [];
    this.items = Array.isArray(items) ? items : [items];

    this.updateAutoCompleteList();

    // subscribe to the events that are emitted by the parent component
    // for example after submitting the form, clear the chips input
    this.props.events?.subscribe({
      next: (res: EventRes) => {
        if (res.eventType === 'clear') this.clear();
      },
    });
  }

  /**
   * triggered as you type in the input
   * don't subscribe to `formControl.valueChanges` here as formControl changes again due to add()
   * see ../input-autocomplete.component
   */
  onInput(event: Event) {
    this.updateAutoCompleteList(
      (<HTMLInputElement>event.target).value || '',
      this.autoCompleteList,
    );
  }

  updateAutoCompleteList(value?: string, list?: AutoCompleteItem[]) {
    toObservable(this.props.autoComplete(value, list)).subscribe({
      next: (items: Array<AutoCompleteItem | string>) => {
        this.autoCompleteList = items
          .map((el) => (typeof el === 'string' ? { label: el, value: el } : el))
          // remove the items that are already added
          .filter((el) => !this.items?.includes(el.value));
      },
      error: (error: any) => {
        console.error('Error in autoComplete:', error);
      },
    });
  }

  onChange($event: any) {
    this.props.onChange?.($event, this.model);
  }

  remove(item: string) {
    this.items = this.items.filter((el: string) => el !== item);
    this.formControl.setValue(this.items);
  }

  clear() {
    this.items = [];
    this.formControl.setValue(this.items);
  }

  edit(item: string, ev: MatChipEditedEvent) {
    let newValue = ev.value?.trim();
    if (!newValue) return this.remove(item);

    this.items = this.items.map((el: string) => (el === item ? newValue : el));
    this.formControl.setValue(this.items);
  }

  add(ev: MatChipInputEvent) {
    let value = ev.value?.trim();
    if (value && !this.items.includes(value)) this.items.push(value);

    // clear thee input
    ev.chipInput.clear();
    this.formControl.setValue(this.items);
  }

  selected(ev: MatAutocompleteSelectedEvent) {
    let value = ev.option.value?.trim();

    if (value && !this.items.includes(value)) this.items.push(value);
    this.formControl.setValue(this.items);

    // clear the input's value
    this.input.nativeElement.value = '';
  }
}
