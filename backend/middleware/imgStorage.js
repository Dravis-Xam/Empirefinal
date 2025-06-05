// config/multer.js
import multer from 'multer';
import { storage } from '../utils/cloudinary.js';

export const upload = multer({ 
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

export const multiUpload = upload.array('images', 6);