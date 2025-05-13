import cloudinary from './cloudinary.config';

export const uploadImageToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
    try {
        console.log('Starting Cloudinary upload for folder:', folder);
        console.log('File details:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });

        if (!file.buffer) {
            throw new Error('File buffer is empty');
        }

        if (!file.mimetype) {
            throw new Error('File mimetype is missing');
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
        }

        // Get file extension
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        
        // Validate file type based on both MIME type and extension
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/*'];
        const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
        const isValidExtension = fileExtension && allowedExtensions.includes(fileExtension);

        if (!isValidMimeType || !isValidExtension) {
            throw new Error(
                `Invalid file type. File must be one of: ${allowedExtensions.join(', ')}. ` +
                `Received file: ${file.originalname} with MIME type: ${file.mimetype}`
            );
        }

        const base64Data = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64Data}`;

        console.log('Uploading to Cloudinary with folder:', `smart-paw/${folder}`);
        
        try {
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: `smart-paw/${folder}`,
                resource_type: 'auto',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            });

            if (!uploadResult || !uploadResult.secure_url) {
                console.error('Invalid Cloudinary response:', uploadResult);
                throw new Error('Invalid response from Cloudinary');
            }

            console.log('Cloudinary upload successful. URL:', uploadResult.secure_url);
            return uploadResult.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary upload error details:', {
                message: uploadError.message,
                stack: uploadError.stack,
                name: uploadError.name,
                http_code: uploadError.http_code,
                error: uploadError.error
            });
            throw new Error(`Cloudinary upload failed: ${uploadError.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Detailed Cloudinary upload error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
};

export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
    try {
        console.log('Attempting to delete image:', imageUrl);
        const publicId = imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log('Successfully deleted image with publicId:', publicId);
        } else {
            console.warn('Could not extract publicId from URL:', imageUrl);
        }
    } catch (error) {
        console.error('Detailed Cloudinary delete error:', error);
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
}; 