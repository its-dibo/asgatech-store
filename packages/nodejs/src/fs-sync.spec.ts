import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import {
  copySync,
  getEntriesSync,
  getExtensionSync,
  getModifiedTimeSync,
  getSizeSync,
  isDirSync,
  mkdirSync,
  moveSync,
  parsePath,
  readSync,
  removeSync,
  resolve,
  writeSync,
} from './fs-sync';
import { objectType } from '@engineers/javascript';
import { existsSync, readFileSync, utimesSync } from 'node:fs';
import { platform } from 'node:process';

let dir = resolve(__dirname, './test!!/fs-sync'),
  file = dir + '/file.txt';

beforeEach(() => {
  removeSync(dir);
  writeSync(file, 'ok');
});

afterEach(() => removeSync(dir));

test('mkdir', () => {
  expect(existsSync(`${dir}/mkdir`)).toBeFalsy();
  mkdirSync(`${dir}/mkdir`);
  expect(existsSync(`${dir}/mkdir`)).toBeTruthy();
});

test('write', () => {
  mkdirSync(dir);
  expect(existsSync(`${dir}/write.txt`)).toBeFalsy();
  writeSync(`${dir}/write.txt`, 'ok');
  expect(existsSync(`${dir}/write.txt`)).toBeTruthy();
  expect(readFileSync(`${dir}/write.txt`).toString()).toEqual('ok');
});

test('write in non-existing dir', () => {
  let file2 = dir + '/non-existing/file.txt';
  expect(existsSync(file2)).toBeFalsy();
  writeSync(file2, 'ok');
  expect(existsSync(file2)).toBeTruthy();
  expect(readFileSync(file2).toString()).toEqual('ok');
});

test('resolve', () => {
  try {
    expect(resolve('/path', 'to/file.js')).toEqual('/path/to/file.js');
  } catch {
    // for windows
    expect(resolve('/path', 'to/file.js')).toContain('path\\to\\file.js');
  }
});

test('parsePath', () => {
  expect(parsePath('/path/to/file.js')).toEqual({
    type: 'file',
    dir: '/path/to',
    name: 'file',
    extension: 'js',
  });

  // todo: parsePath() fails to parse windows paths on a linux platform
  // example: parsePath("\\path\\to\\file") will success on windows but fails on linux
  // also resolve("\\path\\to\\file") on linux outputs "\home\something\\path\\to\\file" which is wrong
  if (platform === 'win32') {
    // windows
    expect(parsePath('\\path\\to\\file.js')).toEqual({
      type: 'file',
      dir: '\\path\\to',
      name: 'file',
      extension: 'js',
    });
  }
});

test('getExtension', () => {
  expect(getExtensionSync('/path/to/file.js')).toEqual('js');
  expect(getExtensionSync('.gitignore')).toEqual('');
  expect(getExtensionSync('/path/to/.gitignore')).toEqual('');
  expect(getExtensionSync('/path/to')).toEqual('');
});

test('size units', () => {
  let size = 1_234_567_890,
    units = { b: 0, kb: 1, mb: 2, gb: 3 };
  expect(size / 1024 ** units.mb).toBeCloseTo(1177.3, 0);
});

test('getSize', () => {
  writeSync(`${dir}/get-size/file1.txt`, 'ok');
  writeSync(`${dir}/get-size/file2.txt`, 'ok');
  expect(getSizeSync(`${dir}/get-size/file1.txt`)).toEqual(2);
  expect(getSizeSync(`${dir}/get-size`)).toEqual(4);
  expect(
    getSizeSync([`${dir}/get-size/file1.txt`, `${dir}/get-size/file2.txt`])
  ).toEqual(4);
});

test('isDir', () => {
  expect(isDirSync(file)).toEqual(false);
  expect(isDirSync(dir)).toEqual(true);
});

test('getModifiedTime', () => {
  expect(Math.floor(getModifiedTimeSync(file))).toBeGreaterThanOrEqual(
    1_624_906_832_178
  );
  expect(Math.floor(getModifiedTimeSync(dir))).toBeGreaterThanOrEqual(
    1_624_906_832_178
  );
});

test('move', () => {
  let file2 = dir + '/file2.txt';
  expect(existsSync(file)).toBeTruthy();
  expect(existsSync(file2)).toBeFalsy();
  moveSync(file, file2);
  expect(existsSync(file)).toBeFalsy();
  expect(existsSync(file2)).toBeTruthy();
});

test('read', () => {
  let fileJson = dir + '/file.json',
    fileArray = dir + '/array.json',
    fileJsonComments = dir + '/comments.json';

  writeSync(fileJson, { x: 1, y: 2 });
  writeSync(fileArray, [1, 2, 3]);
  writeSync(
    fileJsonComments,
    `// this file is created to test reading .json files that contains comments
      // to test stripComments()
 
   {
     /* it should remove all comments */
     /* even this 
          multi-line comment 
       */
     // also this comment
 
     "x": 1,
     "hello": "ok"
   }
   `
  );

  let txt = readSync(file),
    json = readSync(fileJson),
    jsonWithComments = readSync(fileJsonComments),
    array = readSync(fileArray);

  expect(txt.length).toEqual(2);
  expect(txt).toContain('ok');
  expect(objectType(txt)).toEqual('string');
  expect(objectType(json)).toEqual('object');
  expect(objectType(jsonWithComments)).toEqual('object');
  expect(objectType(array)).toEqual('array');
  expect(json).toEqual({ x: 1, y: 2 });
  expect(jsonWithComments).toEqual({ x: 1, hello: 'ok' });
  expect(array).toEqual([1, 2, 3]);
});

test('read from a non-existing file', () => {
  expect(() =>
    readSync(`${dir}/non-existing.txt`, { maxAge: 24 * 60 * 60 })
  ).toThrow('no such file or directory');
});

test('read: maxAge', () => {
  let file = dir + '/file.txt';
  writeSync(file, 'ok');
  expect(readSync(file, { maxAge: 24 * 60 * 60 })).toEqual('ok');
});

test('read from an expired cache', () => {
  let file = dir + '/file.txt';
  writeSync(file, 'ok');
  let date = new Date(),
    today = date.getDate();
  date.setDate(today - 1);
  // in seconds
  let yesterday = date.getTime() / 1000;

  // set creation and modified time to yesterday
  utimesSync(file, yesterday, yesterday);
  expect(() => readSync(file, { maxAge: 1 })).toThrow('expired file');
});

test('remove dir', () => {
  expect(existsSync(file)).toBeTruthy();
  expect(existsSync(dir)).toBeTruthy();
  removeSync(dir);
  expect(existsSync(file)).toBeFalsy();
  expect(existsSync(dir)).toBeFalsy();
});

test('remove non-exists path', () => {
  let file2 = `${dir}/non-existing/file.txt`;
  removeSync(file2);
  expect(existsSync(file2)).toBeFalsy();
});

test('copy a directory and its sub-directories', () => {
  writeSync(`${dir}/copy-dir/file.txt`, '');
  writeSync(`${dir}/copy-dir/sub-dir/file2.txt`, '');
  copySync(`${dir}/copy-dir`, `${dir}/copy-dir2`);
  expect(existsSync(`${dir}/copy-dir2/file.txt`)).toBeTruthy();
  expect(existsSync(`${dir}/copy-dir2/sub-dir/file2.txt`)).toBeTruthy();
});

describe('getEntries', () => {
  let entries = ['file.txt', 'file.js'];
  beforeEach(() => {
    for (let element of entries) {
      writeSync(`${dir}/${element}`, '');
      writeSync(`${dir}/subdir/${element}`, '');
    }
  });

  test('list all entries recursively', () => {
    expect(getEntriesSync(dir).sort()).toEqual(
      // all files in dir with full path
      [
        ...entries
          .map((element) => resolve(`${dir}/${element}`))
          // all files in subdir
          .concat(
            entries.map((element) => resolve(`${dir}/subdir/${element}`))
          ),
        resolve(`${dir}/subdir`),
      ].sort()
    );
  });

  test('filter by function', () => {
    // list all js files only
    expect(getEntriesSync(dir, (element) => element.includes('.js'))).toEqual([
      resolve(`${dir}/file.js`),
      resolve(`${dir}/subdir/file.js`),
    ]);
  });

  test('filter by regex', () => {
    expect(getEntriesSync(dir, /subdir/).sort()).toEqual(
      [
        ...entries.map((element) => resolve(`${dir}/subdir/${element}`)),
        resolve(`${dir}/subdir`),
      ].sort()
    );
  });

  test('filter by type: files', () => {
    expect(getEntriesSync(dir, 'files').sort()).toEqual(
      entries
        .map((element) => resolve(`${dir}/${element}`))
        .concat(entries.map((element) => resolve(`${dir}/subdir/${element}`)))
        .sort()
    );
  });
  test('filter by type: dirs', () => {
    expect(getEntriesSync(dir, 'dirs')).toEqual([resolve(`${dir}/subdir`)]);
  });

  test('depth=0', () => {
    for (let element of entries) {
      writeSync(`${dir}/subdir/extra/${element}`, '');
    }

    expect(getEntriesSync(dir, undefined, 0).sort()).toEqual(
      [
        ...entries.map((element) => resolve(`${dir}/${element}`)),
        resolve(`${dir}/subdir`),
      ].sort()
    );
  });

  test('depth=1', () => {
    for (let element of entries) {
      writeSync(`${dir}/subdir/extra/${element}`, '');
    }

    expect(getEntriesSync(dir, undefined, 1).sort()).toEqual(
      [
        ...entries.map((element) => resolve(`${dir}/${element}`)),
        resolve(`${dir}/subdir`),
        resolve(`${dir}/subdir/extra`),
      ]
        .concat(entries.map((element) => resolve(`${dir}/subdir/${element}`)))
        .sort()
    );
  });

  test('depth=2', () => {
    for (let element of entries) {
      writeSync(`${dir}/subdir/extra/${element}`, '');
    }

    expect(getEntriesSync(dir, undefined, 2).sort()).toEqual(
      [
        ...entries.map((element) => resolve(`${dir}/${element}`)),
        resolve(`${dir}/subdir`),
        resolve(`${dir}/subdir/extra`),
      ]
        .concat(entries.map((element) => resolve(`${dir}/subdir/${element}`)))
        .concat(
          entries.map((element) => resolve(`${dir}/subdir/extra/${element}`))
        )
        .sort()
    );
  });

  test('non existing dir', () => {
    expect(() => getEntriesSync(dir + '/non-existing')).toThrow(
      'no such file or directory'
    );
  });
});
