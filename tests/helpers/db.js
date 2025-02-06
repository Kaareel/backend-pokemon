const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

module.exports = {
  connect: async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Error connecting to the in-memory database', error);
      throw error;
    }
  },

  disconnect: async () => {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      if (mongod) {
        await mongod.stop();
      }
    } catch (error) {
      console.error('Error disconnecting from the in-memory database', error);
      throw error;
    }
  },

  clearDatabase: async () => {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
      }
    } catch (error) {
      console.error('Error clearing the database', error);
      throw error;
    }
  }
};
