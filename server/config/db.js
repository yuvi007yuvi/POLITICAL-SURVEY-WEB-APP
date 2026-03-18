import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is not configured");
    }

    memoryServer = await MongoMemoryServer.create();
    const inMemoryUri = memoryServer.getUri();
    mongoose.set("strictQuery", true);
    await mongoose.connect(inMemoryUri);
    console.log("MongoDB connected (in-memory development mode)");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();

  if (memoryServer) {
    await memoryServer.stop();
  }
};
