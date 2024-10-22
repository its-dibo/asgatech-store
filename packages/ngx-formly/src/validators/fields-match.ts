/* eslint-disable security-node/detect-crlf */
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export interface FieldMatchValidatorOptions {
  // the validation message in case of invalid
  // it can be a string or a function returns a string
  message?:
    | string
    | ((
        form: AbstractControl,
        field: FormlyFieldConfig,
        options: { [key: string]: any },
      ) => string);
  // the name of validation, i.e: `{[name]: {message}}`
  name?: string;
  // the field path to display the error, default: the first unmatched field
  // todo: if Number use keys[errorPath]
  errorPath?: string;
}

/**
 * validate that all fields inside a fieldGroup are matching
 * for example a password and a confirmation fields
 *
 * @param form
 * @param field
 * @param options
 * @returns ValidationErrors object in case of invalid, or undefined in case of valid
 */
export default function fieldsMatchValidator(
  form: AbstractControl,
  field: FormlyFieldConfig,
  options: { [key: string]: any } = {},
): ValidationErrors | undefined {
  if (!field.fieldGroup) return;

  // {key:value} of the fieldGroup's fields
  let fields: Map<string, any> = field.fieldGroup.reduce(
      (map, el) =>
        map.set(el.key as any, form.value[el.key as keyof typeof form.value]),
      // use map instead of object to keep fields order
      new Map(),
    ),
    values = [...fields.values()];

  // `!value`: avoid displaying the message error when values are empty
  // use `required` to make the form invalid if the value is empty
  if (!values.every((value) => !value || value === values[0]))
    return {
      [`${options.name || 'fieldsMatch'}`]: {
        message:
          typeof options.message === 'function'
            ? options.message(form, field, options)
            : options.message || 'fields are Not Matching',
        errorPath:
          options.errorPath ||
          [...fields.keys()].find((key) => fields.get(key) !== values[0]),
      },
    };

  return;
}
