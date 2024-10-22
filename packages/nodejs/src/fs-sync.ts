/**
 * fs and path helpers
 * todo: use `timer` for long-running functions
 */
import {
  resolve as _resolve,
  basename,
  dirname,
  extname,
  join,
  normalize,
  sep,
} from 'node:path';
import { Obj, objectType } from '@engineers/javascript';

import {
  existsSync,
  // same as statSync, but doesn't follow symlinks
  // https://www.brainbell.com/javascript/fs-stats-structure.html
  lstatSync,
  renameSync,
  readdirSync,
  unlinkSync,
  rmdirSync,
  writeFileSync,
  mkdirSync as _mkdirSync,
  MakeDirectoryOptions,
  PathLike,
  WriteFileOptions,
  readFileSync,
  copyFileSync,
} from 'node:fs';

// strip-json-comments v4.0.0 supports esm only
// to use it in a commonjs project use version < 4.0.0
// or use https://www.npmjs.com/package/jsonminify
// https://github.com/sindresorhus/strip-json-comments/issues/53#issuecomment-1024804079
import stripJsonComments from 'strip-json-comments';
import { fileURLToPath } from 'node:url';

/**
 * resolves path segments into an absolute path
 *
 * @param {...any} paths
 * @returns the absolute path
 * @example resolve('/a','b/file.js') => 'a/b/file.js'
 */
export function resolve(...paths: Array<PathLike | URL>): string {
  let stringPaths = paths
    // remove undefined paths
    .filter(Boolean)
    .map((path) => (path instanceof URL ? path.pathname : path.toString()));
  // if it null it will be the current working dir (of the working script)
  return _resolve(normalize(join(...stringPaths)));
}

export interface ParsePath {
  type: 'dir' | 'file';
  dir: string;
  name: string;
  extension: string | undefined;
}
/**
 * parses a path to get information about it
 *
 * @param path
 */
export function parsePath(path: PathLike): ParsePath {
  path = path.toString();
  let extension = getExtensionSync(path);
  return {
    type: isDirSync(path) ? 'dir' : 'file',
    // path of the containing dir
    dir: dirname(path),
    // basename (file or folder name) without extension
    name: basename(path, `.${extension}`),
    extension,
  };
}

/**
 * get file extension without the leading dot
 * files that starts with a dot, the first dot considered as a part of the file name, not extension
 *
 * @param file
 * @example getExtension('file.js') -> 'js'
 * @example getExtension('.gitignore') -> ''
 */
export function getExtensionSync(file: PathLike): string {
  return extname(file.toString()).toLowerCase().replace(/^\./, '');
}

/**
 * get file(s) or directories total size
 *
 * @param path
 * @param unit
 * @param filter
 */
export function getSizeSync(
  path: PathLike | PathLike[],
  unit: 'b' | 'kb' | 'mb' | 'gb' = 'b',
  filter?: Filter,
): number {
  let units = { b: 0, kb: 1, mb: 2, gb: 3 };
  let sizes = recursiveSync(
    path,
    (_path, type) =>
      type === 'file' ? lstatSync(_path).size / 1024 ** units[unit] : undefined,
    filter,
  );

  let sum = (sizes: any) => {
    let total = 0;
    for (let size of sizes) {
      total += Array.isArray(size) ? sum(size) : size;
    }
    return total;
  };
  return Array.isArray(sizes) ? sum(sizes) : sizes;
}

/**
 *
 * @param path
 */
export function isDirSync(path: PathLike): boolean {
  path = resolve(path);
  return existsSync(path) && lstatSync(path).isDirectory();
}

/**
 *
 * @param file
 * @param path
 */
export function getModifiedTimeSync(path: PathLike): number {
  return lstatSync(resolve(path)).mtimeMs;
}

/**
 * creates a directory or more if it doesn't exist
 *
 * @param path path of the directory or a paths array of directories to create
 * @param mode
 * @returns
 * todo: return boolean | {[file:string]: boolean}
 * todo:
 *  - support glob or regex
 *    ex: mkdir(/parent/\.*\/dirName/) creates 'dirName' in each parent/*
 *    dirName must be a string, not a RegExp
 */
export function mkdirSync(
  path: PathLike | PathLike[],
  mode: number | string = 0o777,
): void {
  if (Array.isArray(path)) {
    return path.forEach((p: PathLike) => {
      mkdirSync(p, mode);
    });
  }

  let options: MakeDirectoryOptions = { mode, recursive: true };

  if (!existsSync(path)) {
    _mkdirSync(path, options);
  }
}

export enum MoveOptionsExisting {
  'replace',
  'rename',
  'skip',
  'stop',
  'throw',
}
export interface MoveOptions {
  // string: rename pattern ex: [filename]([count++]).[ext]
  existing: MoveOptionsExisting | string | ((path: string) => string);
}

/*
todo:
 - move multiple files:
    move([ ...[from,to,options] ], globalOptions)
    move({ from: to, from:[to, options]},globalOptions)
    move([...from],to,options)
    move(/Regex/, newPath,options)
    move(dir, newDir)
    move(path, newDir) -> newPath=newDir+basename(path)
    move(path, ./newPath) -> newPath=resolve(oldPath,newPath)
 - if `renameSync` failed, try copy & unlink
 - options.existing: replace|rename_pattern|skip|(name)=>newName
 */

/**
 *
 * @param path
 * @param newPath
 * @param options
 */
export function moveSync(
  path: PathLike,
  newPath: PathLike,
  options?: MoveOptions,
): void {
  // todo: mkdir(path) then renameSync()
  return renameSync(path, newPath);
}

/**
 * delete files or folders recursively
 * https://stackoverflow.com/a/32197381
 *
 * todo:
 * - return boolean | { [path: string]: boolean }
 */

/**
 *
 * @param path
 * @param filter
 * @param keepDir
 */
export function removeSync(
  path: PathLike | PathLike[],
  filter?: Filter,
  // if true, delete the folder content, but not the folder itself, default=false
  keepDir = false,
): void {
  return recursiveSync(
    path,
    (file, type) =>
      type === 'file'
        ? unlinkSync(file)
        : keepDir
          ? undefined
          : rmdirSync(file),
    filter,
  );
}

/**
 *
 * @param source
 * @param destination
 * @param filter
 */
export function copySync(
  source: PathLike,
  destination: string,
  filter: Filter = () => true,
) {
  source = resolve(source);
  destination = resolve(destination);
  return recursiveSync(source, (path, type) => {
    if (type === 'file' && filter(path)) {
      let destination_ = path.replace(source.toString(), destination);
      mkdirSync(dirname(destination_));
      copyFileSync(path, destination_);
    }
  });
}

// todo: fix Cannot find module '@engineers/javascript/objects' from 'packages/nodejs/fs-sync.ts'
// https://stackoverflow.com/questions/68185573/ts-jest-cannot-resolve-tsconfig-aliases
/**
 *
 * @param path
 * @param data
 * @param options
 */
export function writeSync(
  path: PathLike,
  data: any,
  options?: WriteFileOptions,
): void {
  path = resolve(path);
  mkdirSync(dirname(path));
  let dataString = ['array', 'object'].includes(objectType(data))
    ? JSON.stringify(data)
    : data;
  // todo: if(JSON.stringify error)->throw error

  return writeFileSync(path, dataString, options);
}

export interface ReadOptions {
  encoding?: BufferEncoding | null;
  flag?:
    | 'a'
    | 'ax'
    | 'a+'
    | 'ax+'
    | 'as'
    | 'as+'
    | 'r'
    | 'r+'
    | 'rs+'
    | 'w'
    | 'wx'
    | 'w+'
    | 'wx+';
  // the file's maxAge in seconds to be valid, otherwise throw an exception
  maxAge?: number;
}
/**
 * read a file and return its content
 *
 * @param file
 * @param path
 * @param options
 */
export function readSync<T extends Buffer | string | Array<any> | Obj>(
  path: PathLike | URL,
  options?: ReadOptions | BufferEncoding,
): T {
  path = resolve(path);

  let defaultOptions: ReadOptions = {
    encoding: null,
    flag: 'r',
    maxAge: 0,
  };
  let opts: ReadOptions = {
    ...defaultOptions,
    ...(typeof options === 'string' ? { encoding: options } : options),
  };

  if (
    opts.maxAge &&
    opts.maxAge > 0 &&
    getModifiedTimeSync(path) + opts.maxAge * 1000 < Date.now()
  ) {
    throw new Error(`[fs-sync] expired file ${path}`);
  }

  let data = readFileSync(path, {
    encoding: opts.encoding,
    flag: opts.flag,
  });

  if (opts.encoding === undefined) {
    return <T>data;
  }
  data = data.toString();
  return path.toString().trim().slice(-5) === '.json'
    ? JSON.parse(stripJsonComments(data))
    : data;
}

/**
 * strip comments from a content
 * it removes:
 *   // this comment
 *   # and this one
 *   /* and multi-line comments *\/
 *
 * @param content
 * @returns the clean content
 */
/*
 todo:
  - this function causes error if the value contains `/*`
    use https://www.npmjs.com/package/strip-json-comments
    ```
    {
      paths:{
        'dir/*': '/path/to/*'
      }
    }
    ```
*/

/**
 *
 * @param content
 */
export function stripComments(content: string): string {
  // '(\/\/|#).*' => removes `// comment` and `# comment`
  // '\/\*(.|\n)*\*\/' => removes `/* multi-line comments */
  // (.|\n)*: matches any character including newline
  return content.replaceAll(/(\/\/|#).*|\/\*(.|\n)*\*\//g, '');
}

/**
 * get entries (files and directories) recursively.
 *
 * @param dir the root path to start search from.
 * @param filter filters the entries by a function or regex pattern
 * or entry type (file or directory)
 * @param depth if provided, the search will stop at the specified depth
 * @skip dirs to be skipped, by default node_modules and dist are skipped
 * @returns promise that resolves to the filtered entries.
 */
// todo: implement `skipFn`
export function getEntriesSync(
  dir: string | string[] = '.',
  filter?: ((entry: string) => boolean) | RegExp | 'files' | 'dirs',
  depth?: number,
  skip?: ((entry: string) => boolean) | RegExp,
): Array<string> {
  if (Array.isArray(dir)) {
    return dir.flatMap((el) => getEntriesSync(el, filter, depth));
  }
  dir = resolve(dir);
  let filterFn: ((entry: string) => boolean) | undefined =
    filter === 'files'
      ? (entry) => lstatSync(entry).isFile()
      : filter === 'dirs'
        ? (entry) => lstatSync(entry).isDirectory()
        : filter instanceof RegExp
          ? (entry) => (<RegExp>filter).test(entry)
          : typeof filter === 'function'
            ? filter
            : undefined;
  // todo: else if(typeof entry === 'string'){/* glob pattern */}

  let skipFn =
    skip instanceof RegExp
      ? (entry: string) => skip.test(entry)
      : typeof skip === 'function'
        ? skip
        : (entry: string) => ['node_modules', 'dist'].includes(entry);

  let entries = readdirSync(dir);
  let result: Array<string> = [];

  for (let entry of entries) {
    let fullPath = join(dir, entry);
    if (!filterFn || filterFn?.(fullPath)) {
      result.push(fullPath);
    }

    // also add entries of subdirectories
    if (
      (depth === undefined || depth > 0) &&
      lstatSync(fullPath).isDirectory() &&
      !skipFn?.(entry)
    ) {
      let subEntries = getEntriesSync(
        fullPath,
        filterFn,
        depth === undefined ? undefined : depth - 1,
      );
      result = [...result, ...subEntries];
    }
  }

  return result;
}

export type Filter = (path: string, type?: 'dir' | 'file') => boolean;
/**
 * recursively apply a function to a directory and all subdirectories
 *
 * @param path path to a file or directory
 * @param apply the function to be applied to each directory or file
 * @param filter
 * @returns if path is a dir: an array of apply() outputs, if path is file: output of apply()
 */
export function recursiveSync(
  path: PathLike | PathLike[],
  apply: (path: string, type: 'dir' | 'file') => void,
  filter: Filter = () => true,
): any | any[] {
  if (!path) {
    throw new Error('path not provided');
  }

  if (Array.isArray(path)) {
    return path.map((p: PathLike) => recursiveSync(p, apply, filter));
  }

  path = resolve(path.toString());

  if (!existsSync(path)) {
    return;
  }

  let result: any[] = [];
  if (isDirSync(path)) {
    if (filter(path, 'dir')) {
      readdirSync(path).forEach((file: string) => {
        result.push(recursiveSync(`${path}/${file}`, apply, filter));
      });
      apply(path, 'dir');
    }
  } else if (filter(path, 'file')) {
    return apply(path, 'file');
  }

  return result;
}

/**
 * converts paths into POSIX style and remove driver letter from windows paths
 *
 * @param path
 * @param removeDriverLetter remove windows driver letters i.e `C:`
 * @returns
 * @example
 * toPosix('c:\\a\\b') -> '/a/b'
 */
// todo: move to packages/nodejs/fs
export function toPosix(path: PathLike, removeDriverLetter = true): string {
  let newPath = path
    .toString()
    // or use 'node:path': $path.split(path.sep).join(path.posix.sep);
    .replaceAll('\\', '/');

  return removeDriverLetter ? newPath.replace(/^[A-Za-z]:/, '') : newPath;
}

/**
 * ensure cross-platform valid names, i.e. remove forbidden characters in windows such as ':'
 *
 * @param path
 * @returns valid file name
 */
export function validFilePath(path: PathLike): string {
  let pathResolved = resolve(path),
    driverLetter = pathResolved.match(/^[A-Za-z]:/)?.[0] || '',
    filePath = pathResolved.split(/^[A-Za-z]:/)?.[1] || pathResolved;
  return (
    driverLetter +
    filePath
      .split(sep)
      .map((part) => encodeURIComponent(part.trim()))
      .join(sep)
  );
}

/**
 * resolve paths using 'imports' property of package.json
 * https://stackoverflow.com/a/75398262/12577650
 * todo: supported in ESM only
 *
 * @param path
 * @example #alias -> /real/path
 * @returns
 */
// export function resolveImports(path: PathLike): Promise<string> {
//   return import.meta!.resolve!(path.toString()).then((resolvedPath) =>
//     fileURLToPath(resolvedPath)
//   );
// }
