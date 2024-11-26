/* eslint-disable @typescript-eslint/no-var-requires */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { MONGODB_SERVER_URL, MONGODB_DATABASE_NAME, MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;

const connection = mongoose.createConnection(MONGODB_SERVER_URL || 'mongodb://localhost:27017/', {
  dbName: MONGODB_DATABASE_NAME || 'edulution',
  auth: {
    username: MONGODB_USERNAME || 'root',
    password: MONGODB_PASSWORD || 'example',
  },
});

module.exports = connection;
