// formly doesn't support 'file' type, so we create a custom one.
// todo: pass attributes, such as style="display:none;" to replace it with a button
// add it to module:   FormlyModule.forRoot({types: [{ name: 'file', component: FormlyFieldFile, wrappers:['form-field'] }, ]}),
// todo: pass label:  {type:"file",label:"we don't want this value,
// pass it to out child component as an attribute", templateOptions:{attributes:{label:"cover image"}}}
// todo: emit events: progress, response, change (fileAdded)
// todo: move custom types (such as quill) out of formly

import { Component, Directive, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FormlyMaterialModule } from '@ngx-formly/material';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * ControlValueAccessor for the 'file' input
 * https://formly.dev/examples/other/input-file
 * https://github.com/angular/angular/issues/7341
 */
@Directive({
  selector: 'input[type=file]',
  standalone: true,
  host: {
    '(change)': 'onChange($event.target.files)',
    '(blur)': 'onTouched()',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FileValueAccessor, multi: true },
  ],
})
export class FileValueAccessor implements ControlValueAccessor {
  value: any;
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): any {}
  registerOnChange(function_: any): void {
    this.onChange = function_;
  }
  registerOnTouched(function_: any): void {
    this.onTouched = function_;
  }
}

@Component({
  selector: 'formly-field-file-mat',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormlyModule,
    FormlyMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    FileValueAccessor,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class FormlyFileComponent extends FieldType<FieldTypeConfig> {
  @ViewChild('fileInput') fileInput: any;
  // todo: merge new files with existing files
  // files = new Set(this.props.existsFiles)
  files: Set<File> = new Set();

  // todo: also add/remove the files from the form value
  addFiles(): void {
    // click on the original input <input #fileInput>
    this.fileInput.nativeElement.click();
  }

  onFilesAdded(): void {
    let files: File[] = this.fileInput.nativeElement.files;
    if (this.props.multiple) {
      for (let file of files) this.files.add(file);
    } else {
      this.files = new Set([files[0]]);
    }
  }

  remove(file: any): void {
    this.files.delete(file);
  }

  clear(): void {
    this.files.clear();
  }
}
