import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../tmp');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `token-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Only accept PNG and JPG
  const allowedMimes = ['image/png', 'image/jpeg'];

  if (!allowedMimes.includes(file.mimetype)) {
    cb(new Error('Only PNG and JPG files are allowed'));
    return;
  }

  // Max 2MB
  if (file.size > 2 * 1024 * 1024) {
    cb(new Error('File size must be less than 2MB'));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
