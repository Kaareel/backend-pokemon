const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  global.__MONGOINSTANCE = instance;
  const mongoUri = instance
    .getUri()
    .slice(0, instance.getUri().lastIndexOf('/'));

  process.env.MONGO_URI = mongoUri;

  const dbName = 'somedb';
  const conn = await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await conn.connection.db.dropDatabase();
  await mongoose.disconnect();

  console.log('✅ [Global Setup] MongoDB Memory Server started');
};
