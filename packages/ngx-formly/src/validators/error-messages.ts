import { FormlyFieldConfig } from '@ngx-formly/core';

export let reuiredErrorMessage = (error: any, field: FormlyFieldConfig) =>
  `${field.key} is required`;

export let minLengthErrorMessage = (error: any, field: FormlyFieldConfig) =>
  `${field.key} is too short, ${
    field.props!.minLength! - field.formControl!.value.length
  }/${field.props!.minLength} characters left`;

export let maxLengthErrorMessage = (error: any, field: FormlyFieldConfig) =>
  `${field.key} is too long, exceeded by ${
    field.props!.maxLength! - field.formControl!.value.length
  }/${field.props!.maxLength} characters`;
