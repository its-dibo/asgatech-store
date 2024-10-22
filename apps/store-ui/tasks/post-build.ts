import {
  copyFileSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url)),
  projectRoot = resolve(__dirname, '..'),
  root = resolve(projectRoot, '../../..');

let pkg = JSON.parse(
  readFileSync(resolve(projectRoot, 'package.json'), 'utf8'),
);

// copy package*.json files
pkg.scripts = {
  start: pkg.scripts.serve.replaceAll('dist/', ''),
  _node: pkg.scripts._node,
  // see cms-backend
  kill: '',
};

pkg.devDependencies = ['tsconfig-paths', 'dotenv', 'ts-node'].reduce(
  (acc, el) => {
    acc[el] = pkg.devDependencies[el] || '';
    return acc;
  },
  <any>{},
);

writeFileSync(
  resolve(projectRoot, 'dist/package.json'),
  JSON.stringify(pkg, null, '\t'),
);
try {
  copyFileSync(
    resolve(root, 'package-lock.json'),
    resolve(projectRoot, 'dist/package-lock.json'),
  );

  copyFileSync(
    resolve(root, 'pnpm-lock.yaml'),
    resolve(projectRoot, 'dist/pnpm-lock.yaml'),
  );
} catch {}

// copy .env files
readdirSync(projectRoot)
  .filter((el) =>
    // matches `.env` and `.env.*`
    /^\.env($|\..+)/.test(el),
  )
  .map((el) =>
    copyFileSync(resolve(projectRoot, el), resolve(projectRoot, `dist/${el}`)),
  );

writeFileSync(
  resolve(projectRoot, 'dist/browser/configs/environment.js'),
  `export const env = "${process.env.NODE_ENV || 'production'}"`,
);
