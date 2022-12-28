require('./extensions');

const fs = require('fs/promises');
const files = require('./files');
const path = require('path');

/**
 * @typedef {{
 *   source: string;
 *   target?: string;
 * } | string } ICopy
 *
 * @typedef {{
 *   remove: string | string[];
 *   copy: ICopy[];
 *   cleanup: string | string[];
 * }} ISettings
 */

/**
 * Returns the `parcel` settings from the `package.json` file in the specified project root directory.
 *
 * @param {string} projectRoot - The path to the project root directory.
 * @returns {Promise<ISettings>} A promise that resolves to the `parcel settings` from the `package.json` file.
 */
async function settings(projectRoot) {
  const buffer = await fs.readFile(path.join(projectRoot, 'package.json'));
  const packageJson = JSON.parse(buffer);

  return packageJson['parcel-reporter-files'] || {};
}

/**
 * Deletes files and directories in the specified bundle target directories, except for the bundle files and their source maps.
 *
 * @param {string[]} items - The names of the items to be removed.
 * @param {PackagedBundle[]} bundles - An array of bundle objects containing information about the target directories.
 * @return {Promise<void>} A promise that resolves when all items have been removed.
 */
async function remove(items, bundles) {
  const targets = new Set();
  let excludes = new Set();

  for (const bundle of bundles) {
    targets.add(bundle.target.distDir.trimEnd(path.sep) + path.sep);
    excludes.add(bundle.filePath);

    if (['.js', '.css'].includes(path.extname(bundle.filePath))) excludes.add(bundle.filePath + '.map');
  }

  const promises = [];

  excludes = Array.from(excludes);

  for (const target of targets) {
    for (const item of items) {
      if (item === '*') {
        promises.push(files.purge(target, excludes));
      } else {
        promises.push(files.remove(target + item));
      }
    }
  }

  return Promise.all(promises);
}

/**
 * Deletes all files and directories in the specified bundle target directories, except for the bundle files and their source maps.
 *
 * @param {ICopy[]} items -
 * @param {PackagedBundle[]} bundles - An array of bundle objects.
 * @returns {Promise<void>} A promise that resolves when all items have been copied.
 */
async function copy(items, bundles) {
  const targets = new Set(bundles.filter((bundle) => bundle?.target.distDir).map((bundle) => bundle.target.distDir));
  const promises = [];

  for (const target of targets) {
    const targetPath = target.trimEnd(path.sep) + path.sep;

    for (const item of items) {
      let source = item;
      let target = targetPath;

      if (typeof item !== 'string') {
        source = item.source;

        if (item.target) target = targetPath + item.target;
      }

      if (source && target) promises.push(files.copy(source, target));
    }
  }

  return Promise.all(promises);
}

module.exports = { settings, remove, copy };
