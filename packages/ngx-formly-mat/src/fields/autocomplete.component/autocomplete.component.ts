import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toObservable } from '@engineers/rxjs';

export interface AutoCompleteItem {
  value: string;
  label: string;
}

/**
 * an input that supports autocomplete
 *
 * props:
 *   - autoComplete(value, list): Observable<Array<AutoCompleteItem | string>> | Array<AutoCompleteItem | string>
 *     returns the autoCompleteList items, can be observable
 *   - appearance: mat-field appearance
 *
 */
@Component({
  selector: 'formly-autocomplete-mat',
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
  templateUrl: './autocomplete.component.html',
})
export class FormlyAutoCompleteMatComponent extends FieldType<FieldTypeConfig> {
  autoCompleteList: AutoCompleteItem[];

  ngOnInit(): void {
    // get the initial autoComplete list
    // the consumer knows it is an initial update when both list and value are undefined
    this.updateAutoCompleteList();

    // when the input changes, trigger autoComplete() to update `autoCompleteList`
    // or listen to (input), see ../chips.component
    this.formControl.valueChanges.subscribe({
      next: (value) => {
        this.updateAutoCompleteList(value, this.autoCompleteList);
      },
    });
  }

  updateAutoCompleteList(value?: string, list?: AutoCompleteItem[]) {
    toObservable(this.props.autoComplete(value, list)).subscribe({
      next: (items: Array<AutoCompleteItem | string>) => {
        this.autoCompleteList = items.map((el) =>
          typeof el === 'string' ? { label: el, value: el } : el,
        );
      },
      error: (error: any) => {
        console.error('[autoComplete]', error);
      },
    });
  }
}
