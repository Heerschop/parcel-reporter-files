const fs = require('fs/promises');
const path = require('path');

/**
 * Deletes all files and directories in the specified target directory, except those in the exclude set.
 * @param {ISettings} target - The path to the target directory.
 * @param {Set<string>} exclude - A set of paths to exclude from deletion.
 * @returns {Promise<void>} A promise that resolves when all items have been deleted.
 */
async function purge(target, exclude) {
  const pattern = new RegExp('\\' + path.sep + '$');
  const targetPath = target.replace(pattern, '') + path.sep;
  const items = await fs.readdir(targetPath);
  const promises = [];

  for (const item of items) {
    const fullName = targetPath + item;

    if (!exclude.has(fullName)) {
      promises.push(remove(fullName));
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
function remove(target) {
  return fs.rm(target, {
    recursive: true,
    force: true,
  });
}

/**
 * Asynchronously copies a file or directory from the source path to the target path.
 * If the target path ends with a directory separator, the source's basename is appended to the target path.
 *
 * @param {string} source - The source directory pr file to copy.
 * @param {string} target - The target path to copy to.
 * @returns {Promise<void>} - A Promise that resolves when the copy operation is complete.
 */
async function copy(source, target) {
  if (target.endsWith(path.sep)) target += path.basename(source);

  return fs.cp(source, target, {
    force: true,
    recursive: true,
  });
}

module.exports = { purge, remove, copy };
