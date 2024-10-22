import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express, { NextFunction, Request, Response } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { REQUEST, RESPONSE } from '~tokens';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  let app = express(),
    commonEngine = new CommonEngine(),
    __dirname = dirname(fileURLToPath(import.meta.url)),
    browserDistFolder = resolve(__dirname, '../browser'),
    indexHtml = join(__dirname, 'index.server.html');

  app.set('view engine', 'html');
  app.set('views', browserDistFolder);

  // Serve static files from /browser
  app.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: '1y',
    }),
  );

  // Angular routes
  app.get('*', (req: any, res: any, next: NextFunction) => {
    let { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: REQUEST, useValue: req },
          { provide: RESPONSE, useValue: res },
        ],
      })
      // todo: cache routes
      .then((html) => res.send(html))
      .catch((error) => next(error));
  });

  return app;
}

function run(): void {
  let port = process.env.PORT || 4200;

  // Start up the Node server
  let server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
