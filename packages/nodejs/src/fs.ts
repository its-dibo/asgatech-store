/**
 * the promise version of `fs-sync`
 * refer to fs-sync for docs and functions descriptions
 */

import {
  MakeDirectoryOptions,
  PathLike,
  WriteFileOptions,
  constants,
  lstatSync,
  readdirSync,
} from 'node:fs';

import {
  mkdir as _mkdir,
  access,
  copyFile,
  lstat,
  readFile,
  readdir,
  rename,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises';

import { Abortable } from 'node:events';

import {
  Filter,
  MoveOptions,
  ReadOptions,
  resolve,
  stripComments,
} from './fs-sync';
import { basename, dirname, join } from 'node:path';
import { Obj, objectType } from '@engineers/javascript';
import stripJsonComments from 'strip-json-comments';

// todo: import { lstat } from 'fs/promises';

/**
 * get file size asynchronously
 *
 * @param path
 * @param unit
 * @param filter
 */
export function getSize(
  path: PathLike | PathLike[],
  unit: 'b' | 'kb' | 'mb' | 'gb' = 'b',
  filter?: Filter,
): Promise<number> {
  let units = { b: 0, kb: 1, mb: 2, gb: 3 };

  return recursive(
    path,
    (_path, type) =>
      type === 'file'
        ? lstat(_path).then((stats: any) => stats.size / 1024 ** units[unit])
        : // todo: for dirs, size = total sizes of its contents
          undefined,
    filter,
  ).then((sizes) => {
    let sum = (sizes: any) => {
      let total = 0;
      // remove undefined values
      for (let size of sizes.filter(Boolean)) {
        total += Array.isArray(size) ? sum(size) : size;
      }
      return total;
    };
    return Array.isArray(sizes) ? sum(sizes) : sizes;
  });
}

/**
 *
 * @param path
 */
export function isDir(path: PathLike): Promise<boolean> {
  return lstat(path).then((stats: any) => stats.isDirectory());
}

/**
 *
 * @param file
 */
export function getModifiedTime(file: PathLike): Promise<number> {
  return lstat(file).then((stats: any) => stats.mtimeMs);
}

/**
 *
 * @param path
 * @param mode
 */
export function mkdir(
  path: string | string[],
  mode: number | string = 0o777,
): Promise<void> {
  if (Array.isArray(path)) {
    return Promise.all(path.map((p) => ({ [p]: mkdir(p, mode) }))).then(
      () => {},
    );
  }

  let options: MakeDirectoryOptions = { mode, recursive: true };

  return access(path, constants.R_OK)
    .catch(() => _mkdir(path, options))
    .then(() => {});
}

/**
 *
 * @param path
 * @param newPath
 * @param options
 */
export function move(
  path: PathLike,
  newPath: PathLike,
  options?: MoveOptions,
): any {
  return rename(path, newPath);
}

/* todo: return Promise<boolean>
   todo: overlaps:
     export function remove(path: PathLike, options?: RemoveOptions): Promise<boolean>;
     export function remove(path: PathLike[], options?: RemoveOptions): Promise<{ [path: string]: any }>;
*/
/**
 * remove files and folders recursively
 *
 * @param path
 * @param options
 * @param filter
 * @param keepDir
 * @returns
 */
export function remove(
  path: PathLike | PathLike[],
  filter?: Filter,
  keepDir = false,
): Promise<void> {
  return recursive(
    path,
    (file, type) =>
      type === 'file' ? unlink(file) : keepDir ? undefined : rmdir(file),
    filter,
  );
}

/**
 * copy  a file or recursively remove a directory and its subdirectories to another location
 *
 * @param path path of the source directory
 * @param source
 * @param destination
 * @param filter
 * @destination destination of the root dir
 */
export function copy(
  source: PathLike,
  destination: string,
  filter: Filter = () => true,
) {
  source = resolve(source);
  destination = resolve(destination);
  return recursive(
    source,
    (path, type) => {
      path = path.toString();
      if (type === 'file' && filter(path)) {
        let destination_ = path.replace(source.toString(), destination);
        return mkdir(dirname(destination_)).then(() =>
          copyFile(path, destination_),
        );
      }
      return;
    },

    filter,
  );
}

/**
 *
 * @param path
 * @param data
 * @param options
 */
export function write(
  path: PathLike,
  data: any,
  // options for fs.promises.writeFile() is same as fs.writeFileSync() + Abortable{signal:..}
  options?: WriteFileOptions & Abortable,
): Promise<void> {
  path = resolve(path);
  return mkdir(dirname(path))
    .then(() =>
      ['array', 'object'].includes(objectType(data))
        ? JSON.stringify(data)
        : data,
    )
    .then((dataString) => writeFile(path, dataString, options));
  // .then-> {file,data}
}

/**
 * read a file content
 *
 * @param path
 * @param options
 * @returns a promise that resolves to:
 *   - string: if options.encoding!==undefined
 *   - Array or Object: for .json files
 *   - Buffer: otherwise
 */
export function read<T extends Buffer | string | Array<any> | Obj>(
  path: PathLike | URL,
  options?: ReadOptions | BufferEncoding,
): Promise<T> {
  path = resolve(path);
  let defaultOptions: ReadOptions = {
    encoding: null,
    flag: 'r',
    maxAge: 0,
  };
  let options_: ReadOptions = Object.assign(
    defaultOptions,
    typeof options === 'string' ? { encoding: options } : options || {},
  );

  return getModifiedTime(path).then((modified) => {
    if (
      options_.maxAge &&
      options_.maxAge > 0 &&
      modified + options_.maxAge < Date.now()
    ) {
      throw new Error(`[fs-sync] expired file ${path}`);
    }

    return readFile(path, {
      encoding: options_.encoding,
      flag: options_.flag,
    }).then((data) => {
      // if(opts.encoding) readFile() will return string, otherwise it returns Buffer
      // if the consumer wants the data as Buffer, provide options.encoding=undefined explicitly
      // to use the default encoding provide options.encoding=null (the default behavior is)
      // https://stackoverflow.com/a/48818444/12577650
      // https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
      if (options_.encoding === undefined) {
        return data;
      }

      data = data.toString();
      return path.toString().trim().slice(-5) === '.json'
        ? JSON.parse(stripJsonComments(data))
        : data;
    });
  });
}

// todo: getEntriesGenerator() : uses nodejs.generator or rxjs.observable
// to provide results sequentially, better for big directors
// todo: don't use `await` to prevent blocking the execution,
// i.e: execute operations in parallel
// todo: use concurrency(operation,pool=10,...args)
/**
 *
 * @param dir
 * @param filter
 * @param depth
 */
export async function getEntries(
  dir: string | string[] = '.',
  filter?: ((entry: string) => boolean) | RegExp | 'files' | 'dirs',
  depth?: number,
  skip?: ((entry: string) => boolean) | RegExp,
): Promise<Array<string>> {
  if (Array.isArray(dir)) {
    return Promise.all(dir.map((el) => getEntries(el, filter, depth))).then(
      // combine an array of arrays into a single array
      (result) => result.flat(),
    );
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

  let skipFn =
    skip instanceof RegExp
      ? (entry: string) => skip.test(entry)
      : typeof skip === 'function'
        ? skip
        : (entry: string) => ['node_modules', 'dist'].includes(entry);

  let entries = readdirSync(dir);
  let result: Array<string> = [];

  for (let entry of entries) {
    let path = join(dir, entry),
      fullPath = resolve(dir, entry);

    if (!filterFn || filterFn(path)) {
      result.push(path);
    }

    if (
      (depth === undefined || depth > 0) &&
      lstatSync(path).isDirectory() &&
      !skipFn?.(entry)
    ) {
      let subEntries = await getEntries(
        path,
        filterFn,
        depth === undefined ? undefined : depth - 1,
      );
      result = result.concat(subEntries);
    }
  }

  // same as Promise.resolve(result) because the function in async
  return result;
}

/**
 *
 * @param path
 * @param apply
 * @param filter
 */
export function recursive(
  path: PathLike | PathLike[],
  apply: (path: string, type: 'dir' | 'file') => void,
  filter: Filter = () => true,
): Promise<any | any[]> {
  if (!path) {
    return Promise.reject('path not provided');
  }

  if (Array.isArray(path)) {
    return Promise.all(
      // todo: path.map((p) => ({ [p]: recursive(p as string, apply) }))
      path.map((p) => recursive(p, apply, filter)),
    );
  }

  // todo: using `path` causes an issue
  // i.e: path = resolve(path);
  // https://github.com/microsoft/TypeScript/issues/44921
  // https://stackoverflow.com/questions/68283677/typescript-has-different-types-for-the-same-variable-in-the-same-scope
  // https://stackoverflow.com/questions/68240094/variable-type-inside-then-chain

  let _path = resolve(path);
  return (
    access(_path, constants.R_OK)
      .then(() => isDir(_path))
      .then((_isDir: boolean) =>
        _isDir
          ? filter(_path, 'dir')
            ? readdir(_path)
                .then((files: any[]) =>
                  Promise.all(
                    files.map((file) => {
                      return recursive(`${_path}/${file}`, apply, filter);
                    }),
                  ),
                )
                // execute apply on the root dir
                .then(() => apply(_path, 'dir'))
            : undefined
          : filter(_path, 'file')
            ? apply(_path, 'file')
            : undefined,
      )
      // if the file doesn't exist, skip
      .catch((error) => {})
  );

  // todo: or {file: boolean}
  // .then(() => true)
  // .catch(() => false)
}

export function exists(path: PathLike): Promise<boolean> {
  return access(resolve(path), constants.R_OK)
    .then(() => true)
    .catch(() => false);
}

// export { resolveImports } from './fs-sync';
