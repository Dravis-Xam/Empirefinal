import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from  'path';
import helmet from 'helmet';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://empirefinal-osrw.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(helmet())

// MongoDB connection
const MONGODB_URI = process.env.MONGODBCONN;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB with Mongoose'))
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ Mongoose disconnected');
});

import auth from './routes/auth.js';
import purchase from './routes/purchase.js';
import devices from './routes/device.js';
import couponRoutes from './routes/Coupon.js';
import contact from './routes/contact.js';
import customercare from './routes/customercare.js';
import maintenance from './routes/maintenance.js';
import inventory from './routes/inventory.js';
import upload from './routes/upload.js'

app.use('/api/auth', auth);
app.use('/api/buy', purchase);
app.use('/api/devices', devices);
app.use('/api/coupons', couponRoutes);
app.use('/api/contact', contact);
app.use('/api/customercare', customercare);
app.use('/api/maintenance', maintenance);
app.use('/api/inventory', inventory);
app.use('/api/upload', upload);

app.get('/test', (req,res)=> res.send("test"));
import fs from 'fs';

const deviceUploadDir = path.join(process.cwd(), 'uploads', 'devices');
if (!fs.existsSync(deviceUploadDir)) {
  fs.mkdirSync(deviceUploadDir, { recursive: true });
  console.log('📁 Created uploads/devices directory');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HTTP server running on port ${PORT}`);
});