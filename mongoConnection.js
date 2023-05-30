const config = require("./config");
const MongoClient = require('mongodb').MongoClient

const client = new MongoClient(config.mongoConnectionString);
async function connectToDB() {
  try {
    await client.connect();
    console.log('MongoDB Connected successfully to the server');
  } catch (err) {
    console.log('Error: ', err);
  }
}

// Get a reference to the database
function getDatabase() {
  return client.db(config.dbName);
}

module.exports = {
    getDatabase,
    connectToDB
}