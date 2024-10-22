import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';

@Component({
  selector: 'formly-quill',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    QuillEditorComponent,
  ],
  templateUrl: './quill.component.html',
  styleUrls: ['./quill.component.scss'],
})
export class FormlyQuillComponent extends FieldType<FieldTypeConfig> {}
