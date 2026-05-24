import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/laespiga';

export async function connectDB() {
  await mongoose.connect(MONGODB_URI);
  console.log('Conectado a MongoDB:', MONGODB_URI);
}

export default mongoose;
