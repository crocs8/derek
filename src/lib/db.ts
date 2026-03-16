/* eslint-disable no-var */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/easemyprompt";

if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI missing, using local default:", MONGODB_URI);
}

declare global {
    var mongooseGlobal: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}

let cached = global.mongooseGlobal;

if (!cached) {
    cached = global.mongooseGlobal = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (error) {
        cached!.promise = null;
        throw error;
    }

    return cached!.conn;
}

export default connectToDatabase;
