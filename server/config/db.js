import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const connectDatabase = async () => {
  let mongoUri = process.env.MONGODB_URI;

  // Use in-memory DB if no URI is provided, if it's the default placeholder, or if explicitly set to 'memory'
  if (!mongoUri || mongoUri.includes('username:password') || mongoUri === 'memory') {
    memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    console.log("Using In-Memory Database for local testing...");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully!");
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();

  if (memoryServer) {
    await memoryServer.stop();
  }
};
