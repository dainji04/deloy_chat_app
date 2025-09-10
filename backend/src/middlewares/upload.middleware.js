const multer = require('multer');

const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = {
        image: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ],
        video: [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
        ],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    };

    const allAllowedTypes = [
        ...allowedTypes.image,
        ...allowedTypes.video,
        ...allowedTypes.audio,
    ];

    if (allAllowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid file type. Allowed types: ${allAllowedTypes.join(
                    ', '
                )}`
            ),
            false
        );
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: fileFilter,
});

const uploadSingle = upload.single('file');
const uploadAvatar = upload.single('avatar');
const uploadMultiple = upload.array('files', 10); // Max 10 files

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 50MB',
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files',
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name',
            });
        }
    }

    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next(err);
};

module.exports = {
    upload,
    uploadSingle,
    uploadAvatar,
    uploadMultiple,
    handleMulterError,
};
