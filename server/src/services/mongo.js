const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;


async function mongoConnect(){
  return await mongoose.connect(MONGO_URL);
}

module.exports = {
    mongoConnect,
}