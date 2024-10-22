import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FormlyFieldConfig,
  type FormlyFormOptions,
  FormlyModule,
} from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatButtonModule } from '@angular/material/button';
import { FormlyFieldsPipe } from '@engineers/ngx-formly';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';

export interface SubmitEvent {
  data: any;
  form: FormGroup;
  fields?: FormlyFieldConfig[] | null;
}
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    MatButtonModule,
    FormlyFieldsPipe,
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormComponent {
  @Input() fields?: FormlyFieldConfig[] | null;
  @Input() disabled = false;
  @Input() submitButton = 'Submit';
  @Input() model: { [keys: string]: any } = {};
  @Input() options: FormlyFormOptions;
  @Output() submit = new EventEmitter<SubmitEvent>();
  formGroup = new FormGroup(<any>{});

  onSubmit() {
    this.submit.emit({
      data: this.model,
      form: this.formGroup,
      fields: this.fields,
    });
  }
}
