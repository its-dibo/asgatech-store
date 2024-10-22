import { Component, Inject } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormlyMaterialModule } from '@ngx-formly/material';
import {
  MAT_DATE_FORMATS,
  type MatDateFormats,
  MatNativeDateModule,
} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
/**
 * date picker, supporting date range
 *
 * props:
 *  - appearance: mat-field appearance
 *  - range: if true, enable date range picker
 *  - minValue, maxValue
 *  - (change): emitted when the date or date range is changed, emits a date or array of start and end dates
 */

// todo: custom date format, icon, custom validation
// todo: replace props.minValue to props.min, change props.min type from number to Date|number
@Component({
  selector: 'formly-datepicker-mat',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    // adaptor for MatDatepickerModule (or MatMomentDateModule)
    MatNativeDateModule,
    FormlyModule,
    FormlyMaterialModule,
    MatInputModule,
  ],
  // https://material.angular.io/components/datepicker/overview
  providers: [provideLuxonDateAdapter()],
  templateUrl: './date-picker.component.html',
})
export class FormlyDatePickerMatComponent extends FieldType<FieldTypeConfig> {
  constructor(@Inject(MAT_DATE_FORMATS) protected dateFormats: MatDateFormats) {
    super();
  }

  ngOnInit(): void {
    // allow changing the date format
    this.dateFormats.display.dateInput = this.props.format;

    let today = Date.now();
    if (!Number.isNaN(this.props.minValue)) {
      // number of days +/- today
      // for a previous day, use a negative value
      this.props.minValue = new Date(
        today + this.props.minValue * 24 * 60 * 60 * 1000,
      );
    }

    if (!Number.isNaN(this.props.maxValue)) {
      this.props.maxValue = new Date(
        today + this.props.maxValue * 24 * 60 * 60 * 1000,
      );
    }
  }

  onChange($event: any) {
    this.props.onChange?.($event, this.model);
  }
}
