jest.setTimeout(30000); //How long before jest automatically fails test, 30 seconds

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; //To tell it to use NodeJS global promise object
mongoose.connect(keys.mongoURI, { useMongoClient: true }); //useMongoClient to avoid a deprecation warning
