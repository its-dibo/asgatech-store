import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { REQUEST } from '~tokens';
import { Request } from 'express';
import { inject } from '@angular/core';

export function UniversalInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  try {
    let request: Request = inject(REQUEST);

    let clonedRequest = req.clone({
      url: /^https?:/.test(req.url)
        ? req.url
        : `${request.protocol}://${request.get('host')}${
            req.url.startsWith('/') ? '' : '/'
          }${req.url}`,
    });
    return next(clonedRequest);
  } catch (error) {
    console.warn('[universal.interceptor', error);
    return next(req);
  }
}
