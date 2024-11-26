/* eslint-disable @typescript-eslint/no-var-requires */
const moment = require('moment');
const connection = require('../../../common/migration/getDbConnection');

module.exports.up = async function (next) {
  const collection = connection.collection('appconfigs');
  try {
    // eslint-disable-next-line no-underscore-dangle
    await collection.updateMany({}, { $set: { schemaVersion: 0, updatedAt: moment()._d } });
  } catch (e) {
    console.error(`Error running migrations: On updating Document:  ${e}`);
  }
  // eslint-disable-next-line no-console
  console.log('Migration 20241121120816-add-db-version-number completed');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  next();
};

module.exports.down = async function (next) {
  const collection = connection.collection('appconfigs');
  try {
    await collection.updateMany({}, { $unset: { schemaVersion: null } });
  } catch (e) {
    console.error(`Error running migrations: On updating Document:  ${e}`);
  }
  // eslint-disable-next-line no-console
  console.log('Migration 20241121120816-add-db-version-number reverted');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  next();
};
