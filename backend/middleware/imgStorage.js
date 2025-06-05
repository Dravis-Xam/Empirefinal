import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join("uploads", "devices");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 } });
