import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'formly-quill-primeng',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    EditorModule,
  ],
  templateUrl: './quill.component.html',
  styleUrls: ['./quill.component.scss'],
})
export class FormlyQuillPrimeNgComponent extends FieldType<FieldTypeConfig> {}
