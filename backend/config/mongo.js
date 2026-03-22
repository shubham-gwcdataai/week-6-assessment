// config/mongo.js
// Mongoose ODM — connects to MongoDB
const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/secure_api_db';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected via Mongoose');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    // Don't crash the app — MySQL can still work
  }
};

module.exports = { connectMongo };
