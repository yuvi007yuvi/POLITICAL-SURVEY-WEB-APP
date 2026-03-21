import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const connectDatabase = async () => {
  let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // Use in-memory DB if no URI is provided, if it's the default placeholder, or if explicitly set to 'memory'
  if (!mongoUri || mongoUri.includes('username:password') || mongoUri === 'memory') {
    try {
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      console.log(">>> Using In-Memory Database for local testing...");
    } catch (error) {
      console.error(">>> Failed to start MongoMemoryServer:", error.message);
      throw error;
    }
  }

  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`>>> MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`>>> MongoDB connection error (${mongoUri?.split('@')[1] || 'No URI'}):`, error.message);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();

  if (memoryServer) {
    await memoryServer.stop();
  }
};
