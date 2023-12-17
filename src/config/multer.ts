import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Specify the temporary directory
const tempDir = path.join(os.tmpdir(), 'uploads');

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadFile = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {
    // Allow all file types
    cb(null, true);
  }
});

export default uploadFile;
