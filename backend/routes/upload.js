import express from 'express';
import mongoose from 'mongoose';
import { upload } from '../middleware/imgStorage.js';

const router = express.Router();

const ImageSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String,
  },
});

const ImageModel = mongoose.model('Image', ImageSchema);


router.post('/', upload('image'), async (req, res) => {
  try {
    const newImage = new ImageModel({
      name: req.body.name || 'Untitled',
      img: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newImage.save();
    res.status(200).json({ message: 'Image uploaded successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;