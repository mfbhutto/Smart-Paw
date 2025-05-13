import { Injectable } from '@nestjs/common';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../config/cloudinary.upload';

@Injectable()
export class UploadService {
  async uploadUserImage(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Uploading user image:', file.originalname);
      return uploadImageToCloudinary(file, 'users');
    } catch (error) {
      console.error('Error in uploadUserImage:', error);
      throw error;
    }
  }

  async uploadPetImage(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Uploading pet image:', file.originalname);
      return uploadImageToCloudinary(file, 'pets');
    } catch (error) {
      console.error('Error in uploadPetImage:', error);
      throw error;
    }
  }

  async uploadBlogImage(file: Express.Multer.File): Promise<string> {
    try {
      console.log('Uploading blog image:', file.originalname);
      return uploadImageToCloudinary(file, 'blogs');
    } catch (error) {
      console.error('Error in uploadBlogImage:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      console.log('Deleting image:', imageUrl);
      return deleteImageFromCloudinary(imageUrl);
    } catch (error) {
      console.error('Error in deleteImage:', error);
      throw error;
    }
  }
} 