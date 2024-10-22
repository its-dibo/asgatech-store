import lodashTemplate from 'lodash.template';

// todo: extend loadash.TemplateOptions
export interface TemplateOptions {
  // transform the string before it copied into the clipboard
  trans?: (data: string) => string;
  [key: string]: any;
}

/**
 * add data to the clipboard
 *
 * @param data the data to be copied
 * @param values if provided, the param `data` will be treated as a template
 * @param templateOptions lodash TemplateOptions
 */
export function copy(
  data: string,
  values?: { [key: string]: any },
  // todo: TemplateOptions
  templateOptions?: TemplateOptions,
): Promise<string> {
  if (values) {
    try {
      let templateFn = lodashTemplate(data, {
        interpolate: /{(.+?)}/g,
        ...templateOptions,
      });
      data = templateFn(values);
      data = templateOptions?.trans?.(data) || data;
    } catch (error: any) {
      error.message = 'invalid template, ' + error.message;
      return Promise.reject(error);
    }
  }

  return navigator.clipboard
    ? navigator.clipboard.writeText(data).then(() => data)
    : new Promise<string>((resolve, reject) => {
        // https://dev.to/tqbit/how-to-use-javascript-to-copy-text-to-the-clipboard-2hi2
        try {
          let area = document.createElement('textarea');
          area.value = data;
          document.body.append(area);
          area.select();
          if (document.execCommand('copy')) {
            resolve(data);
          }
          area.remove();
        } catch (error: any) {
          reject(error);
        }
      });
}
