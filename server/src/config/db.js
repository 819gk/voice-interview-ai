import mongoose from 'mongoose';
import { env } from './env.js';

let connectionPromise;

// Safe to call many times. On Vercel the same warm function instance handles many
// requests, so the connection is created once and reused.
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then(() => console.log('MongoDB connected'))
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
}
