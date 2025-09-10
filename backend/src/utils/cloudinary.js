const cloudinary = require('../config/cloudinary/index.js');

const uploadToCloudinary = async (file, folder = 'chat-app') => {
    try {
        const baseName = file.originalname.split('.')[0];
        const extension = file.originalname.split('.').pop();
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    display_name: `${baseName}_${Date.now()}.${extension}`,
                    resource_type: 'auto',
                    quality: 'auto',
                    fetch_format: 'auto',
                    eager: [
                        { width: 720, height: 480, crop: 'pad', format: 'mp4' },
                    ],
                    eager_async: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            upload.end(file.buffer);
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok') {
            throw new Error(
                `Failed to delete file from Cloudinary: ${result.result}`
            );
        }
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};
