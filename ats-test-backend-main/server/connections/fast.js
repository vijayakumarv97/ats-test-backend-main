const modelSchema = require("../schemas");
const mongoose = require("mongoose");
const config = require('../../config')

module.exports = (db_name) => {
  const conn = mongoose.createConnection(
    `${config.MongoURI}/${db_name}?retryWrites=true`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
    }
  );
  return modelSchema(conn);
};


