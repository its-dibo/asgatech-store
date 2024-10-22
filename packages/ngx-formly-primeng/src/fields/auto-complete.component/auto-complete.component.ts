import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FloatLabelModule } from 'primeng/floatlabel';
import { toObservable } from '@engineers/rxjs';

@Component({
  selector: 'formly-autocomplete-primeng',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    AutoCompleteModule,
    FloatLabelModule,
  ],
  templateUrl: './auto-complete.component.html',
})
export class FormlyAutoCompletePrimeNgComponent extends FieldType<FieldTypeConfig> {
  completeMethod(query: string) {
    // todo: pass the selected items to the second arg
    toObservable(this.props.autoComplete(query, this.field)).subscribe({
      next: (items: Array<string>) => {
        // todo: convert to [{value, label}]
        // todo: remove items that already selected
        this.props.suggestions = items;
      },
      error: (error: any) => {
        console.error('Error in autoComplete:', error);
      },
    });
  }
}
