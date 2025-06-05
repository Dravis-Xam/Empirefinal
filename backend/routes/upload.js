import express from 'express';
import mongoose from 'mongoose';
import { multiUpload } from '../middleware/imgStorage.js';
import path from 'path';

const router = express.Router();

const DeviceImageSchema = new mongoose.Schema({
  deviceId: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

const DeviceImageModel = mongoose.model('DeviceImage', DeviceImageSchema);

router.post('/upload', multiUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const filenames = req.files.map(file => file.filename); 

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: filenames
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
