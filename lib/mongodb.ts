import mongoose from "mongoose";

/**
 * MongoDB connection singleton for serverless environments.
 * Caches the connection promise in `globalThis` to prevent
 * connection exhaustion across hot-reloaded API routes.
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI environment variable is not defined. " +
      "Please add it to your .env.local file."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/* eslint-disable no-var */
declare global {
  // biome-ignore lint: required for singleton pattern in Next.js serverless
  var mongooseCache: MongooseCache | undefined;
}
/* eslint-enable no-var */

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Returns a cached Mongoose connection. Creates a new connection
 * on the first call and reuses it on subsequent calls.
 *
 * @returns A connected Mongoose instance
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((m) => {
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Pings MongoDB to check connection health.
 * @returns Latency in milliseconds, or -1 if unreachable
 */
export async function pingDatabase(): Promise<number> {
  try {
    const start = Date.now();
    const conn = await connectToDatabase();
    await conn.connection.db?.admin().ping();
    return Date.now() - start;
  } catch {
    return -1;
  }
}
