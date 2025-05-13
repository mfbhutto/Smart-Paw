import { v2 as cloudinary } from 'cloudinary';

// Configuration
try {
    cloudinary.config({ 
        cloud_name: 'dermqwkl2', 
        api_key: '338361361371727', 
        api_secret: '2kINjK-bbAr_ohReHphUCRvYfgA'
    });
    console.log('Cloudinary configuration successful');
} catch (error) {
    console.error('Cloudinary configuration error:', error);
    throw new Error('Failed to configure Cloudinary');
}

export default cloudinary; 