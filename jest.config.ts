// https://jestjs.io/docs/cli
// eslint-disable-next-line n/no-extraneous-import
import type { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readSync } from '@engineers/nodejs';

export default jestConfig();

export interface Options extends Config.InitialOptions {
  // path to the root dir of the project's jest.config, may be different that the root jest.config
  _projectRoot?: string;
  _prefix?: string;
  _module?: 'commonjs' | 'es';
  // default: projectRoot.tsconfig.spec.json | root.tsconfig.json
  _tsConfigPath?: string;
  // extra info about the project, may have impact in some properties like 'preset'
  _extra?: Array<'angular'>;
}

/**
 *
 * @param options
 * @returns
 */
export function jestConfig(options: Options = {}): Config.InitialOptions {
  let opts: Options = {
    ...options,
    _prefix: options._projectRoot || '<rootDir>',
  };

  opts._tsConfigPath =
    opts._tsConfigPath ||
    (existsSync(resolve(opts._projectRoot || __dirname, './tsconfig.json'))
      ? resolve(opts._projectRoot || __dirname, './tsconfig.json')
      : resolve(__dirname, './tsconfig.json'));

  if (!opts._module) {
    // read the property pkg.type
    let pkg = readSync(
      resolve(opts._projectRoot || opts.rootDir || __dirname, './package.json')
    ) as {
      [key: string]: any;
    };
    opts._module = pkg?.['type'] === 'module' ? 'es' : 'commonjs';
  }

  // or if(!opts.extra)
  if (!opts._extra?.includes('angular')) {
    let pkg = readSync(
      resolve(opts._projectRoot || opts.rootDir || __dirname, './package.json')
    ) as {
      [key: string]: any;
    };
    if (
      pkg.dependencies &&
      Object.keys(pkg.dependencies).includes('@angular/core')
    ) {
      opts._extra = opts._extra || [];
      opts._extra?.push('angular');
    }
  }

  let defaultConfig: Config.InitialOptions = {
    // rootDir must be set to the nearest tsconfig path,
    // so moduleNameMapper could resolve tsconfig.paths correctly
    // if rootDir set to the workspace's root (i.e ../..), use `testMatch`,
    // otherwise each test file runs multiple time
    rootDir: __dirname,
    // use 'ts-jest' or 'ts-jest/presets/*' to enable type checking while testing
    // for ESM use 'ts-jest/presets/default-esm'
    // use 'jest-preset-angular' for angular projects (built in top of ts-jest)
    // 'jest-preset-angular' requires tsconfig.spec.json file
    preset:
      opts.preset ||
      (opts._extra?.includes('angular')
        ? // transform non-js files with 'jest-preset-angular' to let jest understand their syntax
          // so it can compile angular component's template and style files
          // https://thymikee.github.io/jest-preset-angular/docs/getting-started/options/#exposed-configuration
          // https://github.com/thymikee/jest-preset-angular/issues/992?notification_referrer_id=MDE4Ok5vdGlmaWNhdGlvblRocmVhZDIzMTMyODI4NTE6NTczMDg1MzE%3D#issuecomment-902427868
          'jest-preset-angular'
        : opts._module === 'es'
        ? 'ts-jest/presets/default-esm'
        : 'ts-jest'),
    testEnvironment: 'node',
    // don't inject jest methods (test,describe,...) to the global scope
    // you must import them from '@jest/globals
    injectGlobals: false,
    // run tests for only files that changed from the last commit
    onlyChanged: true,
    // output the coverage report (--coverage in cli)
    collectCoverage: false,
    moduleDirectories: ['node_modules', 'types'],
    moduleFileExtensions: [
      'ts',
      'tsx',
      'mts',
      'cts',
      // todo: fix: https://github.com/kulshekhar/ts-jest/issues/3929#issuecomment-1345582824
      // 'mjs',
      'cjs',
      'js',
      'jsx',
      'json',
      'html',
      'scss',
      'css',
      'node',
    ],
    transform: {
      // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#manual-configuration
      '^.+\\.m?[tj]sx?$': 'ts-jest',
    },
    moduleNameMapper: getPaths(opts._tsConfigPath, opts._prefix),

    // todo: causes error: AggregatedResult must be present after test run is complete
    // watch: true,

    /*
    ignore files inside 'dist' dirs to solve the error:
    `The name `@engineers/*` was looked up in the Haste module map. 
     It cannot be resolved, because there exists several different files, or packages`
     this error occurs when ./dist/package.json has the same name as ./package.json
    */
    modulePathIgnorePatterns: ['dist', 'test!!'],
    // todo: exclude /dist
  };

  if (opts._extra?.includes('angular')) {
    defaultConfig.transform!['^.+\\.m?(ts|js|html)$'] = 'jest-preset-angular';
    // todo: remove 'jest-setup.ts' from all workspaces
    defaultConfig.setupFilesAfterEnv = [`${__dirname}/jest-setup.ts`];
    // run 'ngcc' https://thymikee.github.io/jest-preset-angular/docs/guides/angular-ivy/
    // replaces the deprecated: `import 'jest-preset-angular/ngcc-jest-processor'`;
    defaultConfig.globalSetup = 'jest-preset-angular/global-setup';
  } else
    defaultConfig.transform!['^.+\\.m?[tj]sx?$'] = [
      'ts-jest',
      { useESM: opts._module === 'es' },
    ];

  if (opts._projectRoot) {
    defaultConfig.testMatch = defaultConfig.testMatch || [
      `${opts._projectRoot}/**/*.spec.ts`,
    ];
  } else {
    // todo: 'projects' causes warnings like: Unknown option "onlyChanged" ...
    defaultConfig.projects = [
      '<rootDir>/packages/**/jest.config.ts',
      '<rootDir>/apps/**/jest.config.ts',
    ];
  }

  if (opts._module === 'es') {
    defaultConfig.extensionsToTreatAsEsm = ['.ts'];
  }

  for (let key in opts) {
    if (key.startsWith('_')) delete opts[key as keyof typeof opts];
  }

  let config = { ...defaultConfig, ...opts };
  return config;
}

/**
 *
 * @param tsConfigPath
 * @param prefix
 * @returns
 */
export function getPaths(
  tsConfigPath = './tsconfig.json',
  prefix = '<rootDir>'
) {
  // todo: fix: cannot perform JSON.parse() when tsconfig.json has comments
  let tsConfig = readSync(tsConfigPath) as { [key: string]: any };
  /*
   pathsToModuleNameMapper generates moduleNameMapper from tsconfig.compilerOptions.paths
   https://huafu.github.io/ts-jest/user/config/#paths-mapping
   // fixed: pathsToModuleNameMapper is mapping to `<rootDir>/./packages/$1`
   https://github.com/kulshekhar/ts-jest/issues/2709
   // todo: add '~' to every project or package jest.config
   */

  return pathsToModuleNameMapper(tsConfig?.compilerOptions?.paths || {}, {
    prefix,
  });
}

/*
 // to change 'ts-jest' options

  // get the default ts-jest options of 'jest-preset-angular' to override them
 const tsJestPreset = require('jest-preset-angular/jest-preset').globals['ts-jest'];
 {
   globals:{
    'ts-jest': {
      // default options
      ...tsJestPreset,
      // your options
      tsConfig: 'tsconfig.spec.json'
    }
  }
}
 }

*/
