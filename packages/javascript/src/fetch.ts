import { objectType } from './objects';

/**
 *
 * @param path
 * @param options
 */
export default function request(
  path: string,
  options: RequestInit | string = {}
) {
  if (typeof options === 'string') options = { method: options };
  if (!(options.headers instanceof Headers))
    options.headers = new Headers(options.headers);
  if (options.body && ['object', 'array'].includes(objectType(options.body))) {
    options.body = JSON.stringify(options.body);
    options.headers.append('Content-Type', 'application/json');
  }

  // todo: stringify headers values

  // todo: catch errors & !200 status codes
  return fetch(path, {
    method: 'GET',
    ...options,
  }).then((res) => {
    let resCloned = res.clone();
    return res.json().catch((error) => resCloned.text());
  });
}
