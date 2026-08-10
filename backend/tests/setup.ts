import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  // Start the replica set (required for transactions)
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  
  const uri = replSet.getUri();
  
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Aggressively clear the DB between each run
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (replSet) {
    await replSet.stop();
  }
});
