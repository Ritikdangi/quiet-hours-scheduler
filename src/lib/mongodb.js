import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("⚠️ MONGODB_URI is not defined in .env.local");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "studyblocks",
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
