const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!(url-join)/)'],

  ...nxPreset,
};
