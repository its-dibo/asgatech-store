import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import {
  FieldType,
  FieldTypeConfig,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface Props {
  /** if it null, the button will not rendered */
  nextButton?: StepButton;
  prevButton?: StepButton;
}

export interface StepButton {
  name?: string | null;
  disabled?: boolean;
  // todo: `stepper: template`
  fn?: (direction: 'next' | 'previous', stepper: any) => void;
  icon?: string;
  color?: 'primary' | 'accent' | 'Warn';
}

@Component({
  selector: 'formly-stepper-mat',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
/**
 * add multi-step form
 * @example
 * ```
 * fields = [
 *             {
 *               type: FormlyStepperComponent,
 *               fieldGroup: [
 *                 {
 *                   key: 'step1',
 *                   props: {
 *                     label: 'step1',
 *                   },
 *                   fieldGroup: [{ key: 'field1' }, { key: 'field2' }],
 *                 },
 *                 {
 *                   key: 'step2',
 *                   props: {
 *                     label: 'step2',
 *                   },
 *                   fieldGroup: [{ key: 'field3' }, { key: 'field4' }],
 *                 },
 *               ],
 *             },
 *           ]
 *           ```
 */
export class FormlyStepperComponent extends FieldType<FieldTypeConfig> {
  @Output() ev: any;

  ngOnInit() {
    // todo: type checking for props
    if (this.props.nextButton !== null) {
      this.props.nextButton = {
        name: 'Next',
        fn: this.move,
        icon: 'arrow_right',
        color: 'primary',
        ...this.props.nextButton,
      };
    }
    if (this.props.prevButton !== null) {
      this.props.prevButton = {
        name: 'Previous',
        fn: this.move,
        icon: 'arrow_left',
        color: 'primary',
        ...this.props.prevButton,
      };
    }
  }

  move(direction: 'next' | 'previous', stepper: any) {
    if (direction === 'next') {
      stepper.next();
    } else if (direction === 'previous') {
      stepper.previous();
    }
  }

  isValid(field: FormlyFieldConfig): boolean {
    return !!(
      field.formControl?.valid ||
      field.fieldGroup?.every((el) => this.isValid(el))
    );
  }
}
