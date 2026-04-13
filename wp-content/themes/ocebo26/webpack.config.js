const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

const blocks = [
  'hero',
  'checklist',
  'services-grid',
  'pourquoi',
  'chiffres',
  'logos-slider',
  'faq',
  'contact-cta',
];

const entry = {};
blocks.forEach((block) => {
  entry[`blocks/${block}/index`] = path.resolve(__dirname, `blocks/${block}/src/index.js`);
});

module.exports = {
  ...defaultConfig,
  entry,
  output: {
    ...defaultConfig.output,
    path: path.resolve(__dirname, 'build'),
  },
};
