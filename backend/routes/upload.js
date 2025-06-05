import express from 'express';
import { upload } from '../middleware/imgStorage.js';

const router = express.Router();

router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const imageUrls = req.files.map(file => file.path);
    res.status(200).json({ message: 'Images uploaded successfully', urls: imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
