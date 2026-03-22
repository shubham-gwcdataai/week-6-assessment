const mongoose = require('mongoose');

const connectMongo = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/secure_api_logs';

  mongoose.connection.on('connected',    () => console.log('✅ MongoDB connected (Mongoose ODM)'));
  mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));
  mongoose.connection.on('error',        (err) => console.error('❌ MongoDB error:', err.message));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Retrying in 10s…');
    setTimeout(connectMongo, 10000);
  }
};

module.exports = connectMongo;