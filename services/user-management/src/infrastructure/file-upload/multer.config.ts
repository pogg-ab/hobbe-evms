import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const baseUploadDir = './public/uploads';
fs.ensureDirSync(baseUploadDir);

const getUploadDir = (fileType: 'profile_image' | 'national_id' | 'llc_document') => {
    const uploadDir = path.join(baseUploadDir, fileType);
    fs.ensureDirSync(uploadDir);
    return uploadDir;
};

const generateFileName = (originalName: string): string => {
    const fileExtension = path.extname(originalName);
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    return `${timestamp}-${uuidv4()}${fileExtension}`;
};

const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images are allowed'), false);
    }
};

const documentFileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only PDFs and images are allowed'), false);
    }
};

export const multerConfig = (fileType: 'profile_image' | 'national_id' | 'llc_document') => ({
    storage: diskStorage({
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
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: fileType === 'profile_image' || fileType === 'national_id' ? imageFileFilter : documentFileFilter,
});
