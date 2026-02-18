const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// dotenv.config();
// const mongoURI=process.env.MONGO_URI;

const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      // mongoose 6+ handles most options internally
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
