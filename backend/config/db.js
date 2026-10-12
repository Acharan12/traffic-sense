const mongoose = require('mongoose');

// Disable command buffering so mongoose fails immediately if disconnected instead of hanging
mongoose.set('bufferCommands', false);

let isConnected = false;

const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  No MONGODB_URI provided - running in in-memory demo mode');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️  Running with in-memory demo store - demo mode active');
  }
};

module.exports = { connectDB, isDbConnected };
