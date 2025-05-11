import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

// Base directory for uploaded files
const baseUploadDir = './public/uploads';
fs.ensureDirSync(baseUploadDir);

// Get the directory for the specific file type
const getUploadDir = (fileType: 'thumbnail' | 'cover_image') => {
  const uploadDir = path.join(baseUploadDir, fileType);
  fs.ensureDirSync(uploadDir);
  return uploadDir;
};

// Generate a unique file name
const generateFileName = (originalName: string): string => {
  const fileExtension = path.extname(originalName);
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  return `${timestamp}-${uuidv4()}${fileExtension}`;
};

// File upload configuration
export const multerConfig = (fileType: 'thumbnail' | 'cover_image') => ({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      const uploadDir = getUploadDir(fileType);
      callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
      const fileName = generateFileName(file.originalname);
      callback(null, fileName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Max file size: 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed'), false);
    }
  },
});
