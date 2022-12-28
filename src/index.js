const { Reporter } = require('@parcel/plugin');
const parcel = require('./parcel');

const hooksReporter = new Reporter({
  async report({ event, options }) {
    if (event.type === 'buildSuccess') {
      const bundles = event.bundleGraph.getBundles();
      const settings = await parcel.settings(options.projectRoot);

      if (settings.remove) await parcel.remove(settings.remove, bundles);

      if (settings.copy) await parcel.copy(settings.copy, bundles);
    }
  },
});

module.exports = hooksReporter;
