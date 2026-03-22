import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
import streamifier from 'streamifier';
import { UploadedFile } from '../types/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export const uploadToCloudinary = async (
  file: UploadedFile
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'academic-content',
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    if (file.buffer) {
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    } else {
      reject(new Error('No file buffer available'));
    }
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export const getSignedUrl = async (publicId: string): Promise<string> => {
  const result = await cloudinary.url(publicId, {
    sign_url: true,
    secure: true
  });
  return result;
};
