import mongoose from 'mongoose';

const connectDb = async (): Promise<void> => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable not set');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "blog",
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
};

export default connectDb;
