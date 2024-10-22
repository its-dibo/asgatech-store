// todo: rename to fieldsMatchValidator (fields...)
import fieldsMatchValidator from '../validators/fields-match';

/**
 * a preset field that displays two inputs, a password and a confirmPassword fields,
 * and uses the validation @engineers/validations/fieldsMatch *
 * `@engineers/presets/password` must be added to presets
 */

export default {
  name: 'passwordConfirm',
  config: {
    fieldGroup: [
      {
        type: '#password',
      },
      {
        type: '#password',
        key: 'passwordConfirm',
        props: {
          label: 'confirm password',
          description: 'repeat the password again',
        },
      },
    ],
    validators: {
      validation: [fieldsMatchValidator],
    },
  },
};
