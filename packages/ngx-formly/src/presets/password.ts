import { strongPassword } from '@engineers/javascript';

// https://formly.dev/docs/guide/formly-field-presets
// {type: #password, key:confirmPass}

// todo: extensions VS pipe to set a default field.label
// https://formly.dev/docs/guide/custom-formly-extension/

/**
 * a preset for a password input that offers:
 * - type: password
 * - defaults: key=password, label:password, description
 * - validations: strongPassword
 */
export default {
  // todo: add custom type: password, icon to show/hide chars
  // todo: validations/strongPassword({specialChars: true, minLength:6, ...})
  name: 'password',
  config: {
    key: 'password',
    props: {
      label: 'password',
      description:
        'password must be > 6 characters and contains letters, numbers and special characters',
      required: true,
      minLength: 6,
      pattern: strongPassword(),
    },
  },
};
