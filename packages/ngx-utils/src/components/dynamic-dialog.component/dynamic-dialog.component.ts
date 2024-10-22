import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface DialogData {
  title?: string;
  component?: any;
  /** pass any html content, will be displayed after the component */
  content?: string;
  hideCloseButton?: boolean;
  closeButtonColor?: 'primary' | 'accent' | 'warn';
  /** the inputs that passed to the hosted component */
  inputs?: { [key: string]: any };
}

/**
 * dynamically inject a component into the dialog
 *
 * @example
 * ```
 *  this.dialog.open(DynamicDialogComponent, {
 *    data: {
 *     component: MyComponent,
 *     inputs: {}
 *    }
 * })
 * ```
 */
@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class DynamicDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DynamicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}
}
