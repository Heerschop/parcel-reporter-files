require('./extensions');

const fs = require('fs/promises');
const path = require('path');
const glob = require('fast-glob');
const normalize = require('normalize-path');

/**
 * Posix/unix-like forward file path slashe
 */
const POSIX_SEP = '/';

/**
 * Deletes all files and directories in the specified target directory, except those in the exclude array.
 * @param {string} target - The path to the target directory.
 * @param {string[]} exclude - A set of items to exclude from deletion.
 * @returns {Promise<void>} A promise that resolves when all items have been deleted.
 */
async function purge(target, exclude) {
  target = normalize(target) + POSIX_SEP;

  exclude = exclude.map((item) => normalize(item, false));

  const items = await fs.readdir(target);
  const promises = [];

  for (const item of items) {
    if (!exclude.includes(target + item)) {
      promises.push(fs.rm(target + item, { recursive: true, force: true }));
    }
  }

  return Promise.all(promises);
}

/**
 * Removes the specified files and directories.
 *
 * @param {string} target - The path to the target to be removed.
 * @return {Promise<void>} A promise that resolves when the target has been removed.
 */
async function remove(target) {
  target = normalize(target, false);

  if (glob.isDynamicPattern(target)) {
    const promises = [];

    // Remove files
    {
      const entries = await glob(target, { dot: true });

      for (const entry of entries) {
        promises.push(fs.rm(entry, { recursive: true, force: true }));
      }
    }

    await Promise.all(promises);

    // Remove empty directories
    {
      const entries = await glob(target, { dot: true, onlyDirectories: true });

      entries.sort((entry1, entry2) => entry2.length - entry1.length);

      for (const entry of entries) {
        if ((await fs.readdir(entry)).length === 0) {
          await fs.rm(entry, { recursive: true, force: true });
        }
      }
    }
  }

  return fs.rm(target, { recursive: true, force: true });
}

/**
 * ...
 *
 * @param {string} path -
 * @returns {any} -
 */
function splitGlob(path) {
  const entries = normalize(path, false).split(POSIX_SEP);

  let index = entries.findIndex((item) => item && glob.isDynamicPattern(item));

  if (index === -1) index = entries.length;

  return {
    path: entries.slice(0, index).join(POSIX_SEP),
    pattern: entries.slice(index).join(POSIX_SEP),
  };
}

/**
 * Asynchronously copies a file or directory from the source path to the target path.
 * If the target path ends with a directory separator, the source's basename is appended to the target path.
 *
 * @param {string} source - The source directory or file to copy.
 * @param {string} target - The target path to copy to.
 * @returns {Promise<void>} - A Promise that resolves when the copy operation is complete.
 */
async function copy(source, target) {
  const match = splitGlob(source);

  console.log('source:', source);
  console.log('target:', target);
  console.log('match:', match);

  console.log();

  target = normalize(target, false);

  if (match.pattern) return globCopy(match.path, target, match.pattern);

  if (target.endsWith(POSIX_SEP)) target += path.basename(source);

  return fs.cp(source, target, {
    force: true,
    recursive: true,
  });
}

/**
 * Asynchronously copies a file or directory from the source path to the target path.
 * If the target path ends with a directory separator, the source's basename is appended to the target path.
 *
 * @param {string} source - The source directory.
 * @param {string} target - The target directory.
 * @param {string} pattern - The pattern for selecting the files to copy.
 * @returns {Promise<void>} - A Promise that resolves when the copy operation is complete.
 */
async function globCopy(source, target, pattern) {
  const promises = [];

  source = source.trimEnd(POSIX_SEP) + POSIX_SEP;
  target = target.trimEnd(POSIX_SEP) + POSIX_SEP;

  // Copy files and directories
  {
    const entries = await glob(pattern, {
      dot: true,
      cwd: source,
    });

    console.log('entries:', entries);

    for (const entry of entries) {
      console.log('copyFile.source:', source + entry);
      console.log('copyFile.target:', target + entry);
      console.log();

      promises.push(
        fs
          .mkdir(path.dirname(target + entry), { recursive: true })
          .then(() => fs.copyFile(source + entry, target + entry))
      );
    }
  }

  // Create the empty directories
  {
    const entries = await glob(pattern, {
      dot: true,
      cwd: source,
      onlyDirectories: true,
    });

    for (const entry of entries) {
      promises.push(fs.mkdir(target + entry, { recursive: true }));
    }
  }

  return Promise.all(promises);
}

module.exports = { purge, remove, copy };

// (async () => {
//   // patternCopy('temp/source', 'temp/target', '**');
//   //console.log('splitGlobPattern:', splitGlob('temp//target/aaa'));
//   //copy('temp/source/**/*1', 'temp/target');
//   await copy('temp/source/**', 'temp/target/');
//   // await remove('temp/target/**');
//   // //await remove('temp/target/**');

//   // const entries = await glob('temp/target/**', {
//   //   dot: true,
//   //   onlyDirectories: true,
//   // });

//   // entries.sort((entry1, entry2) => entry2.length - entry1.length);

//   purge('temp/target', ['temp/target/directory3']);

//   //console.log('entries:', entries);
// })();
