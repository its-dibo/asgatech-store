import { Pipe, PipeTransform } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { objectType } from '@engineers/javascript';

@Pipe({
  name: 'formlyFields',
  standalone: true,
})
export class FormlyFieldsPipe implements PipeTransform {
  /**
   * adjusts the formly fields array
   *
   * @param value
   * @param args
   * @param fields
   * @returns
   */
  transform(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields?.map((field) => {
      if (!field.props) {
        field.props = {};
      }

      // mark the field as required by appending "*" to its key
      if (typeof field.key === 'string' && field.key.endsWith('*')) {
        field.key = field.key.slice(0, -1);
        field.props.required = true;
      }

      if (!field.props.label && typeof field.key === 'string') {
        // replace camelCase string to space delimited string
        field.props.label = field.key.replaceAll(
          /[A-Z]/g,
          (m) => ` ${m.toLowerCase()}`,
        );
      }

      // capitalize the first character
      if (field.props.label)
        field.props.label =
          field.props.label.charAt(0).toUpperCase() +
          field.props.label.slice(1);

      if (field.fieldGroup) {
        field.fieldGroup = this.transform(field.fieldGroup);
      } else {
        if (!field.type) {
          // add missing type
          field.type = field.props.options
            ? 'select'
            : field.props.cols || field.props.rows
              ? 'textarea'
              : ['password', 'email'].includes(
                    (<string>field.key).toLowerCase(),
                  )
                ? <string>field.key
                : 'input';
        }

        // convert `{key: email}` to `{key: email, type: input, props:{type: email}}`
        if (
          typeof field.type === 'string' &&
          ['password', 'email'].includes(field.type.toLowerCase())
        ) {
          field.props.type = field.type;
          field.type = 'input';
        }

        // adjust options format to `[{value: key, label: value}]`
        // convert `{key: value}`
        // convert "value1,value2"
        // convert `["value"]`
        if (field.props?.options) {
          if (objectType(field.props.options) === 'object') {
            field.props.options = Object.keys(field.props.options).reduce(
              (acc, key) => {
                acc.push({
                  value: key,
                  label:
                    field.props!.options![
                      key as keyof typeof field.props.options
                    ],
                });
                return acc;
              },
              <any>[],
            );
          } else if (Array.isArray(field.props.options)) {
            field.props.options = field.props.options.map((el) => {
              return typeof el === 'string' ? { label: el, value: el } : el;
            });
          } else if (typeof field.props?.options === 'string') {
            field.props.options = (<string>field.props.options)
              .split(',')
              .map((el) => ({ value: el, label: el }));
          }
        }

        // move props from top-level into props
        [
          'description',
          'label',
          'disabled',
          'placeholder',
          'options',
          'rows',
          'cols',
          'hidden',
          'max',
          'min',
          'maxLength',
          'minLength',
          'pattern',
          'required',
          'tabindex',
          'readonly',
          'attributes',
          'step',
          'focus',
          'blur',
          'keyup',
          'keydown',
          'keypress',
          'click',
          'change',
        ].forEach((prop) => {
          let value = field[prop as keyof FormlyFieldConfig];
          if (value && !field.props![prop]) {
            if (typeof value === 'function') {
              // use expressions to dynamically change a property
              field.expressions = {
                [`props.${prop}`]: field.props![prop],
                ...field.expressions,
              };
            } else {
              field.props![prop] = value;
            }

            delete field[prop as keyof FormlyFieldConfig];
          }
        });

        // make the select field filterable by if it has more than 5 options
        if (
          field.type === 'select' &&
          field.props.filter !== false &&
          Array.isArray(field.props.options) &&
          field.props.options.length > 5
        ) {
          field.props.filter = true;
        }
      }

      // todo: add a loader to the fields that its options or values are Observables
      // the consumer has to define the css class .formly-loader
      // if (isObservable(field.props?.options)) {
      //   field.className = 'formly-loader';
      //   field.props.options.pipe(
      //     finalize(() => {
      //       field.className = '';
      //     }),
      //   );
      // }
      return field;
    });
  }
}
