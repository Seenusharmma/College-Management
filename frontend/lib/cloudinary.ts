import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

interface UploadOptions {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv'];

function getResourceType(mimetype: string): 'image' | 'raw' | 'video' | 'auto' {
  if (IMAGE_TYPES.includes(mimetype)) {
    return 'image';
  }
  if (mimetype.startsWith('video/')) {
    return 'video';
  }
  if (DOCUMENT_TYPES.includes(mimetype) || mimetype.startsWith('application/')) {
    return 'raw';
  }
  return 'auto';
}

export async function uploadToCloudinary(file: UploadOptions): Promise<{ url: string; publicId: string }> {
  const resourceType = getResourceType(file.mimetype);
  const isDocument = resourceType === 'raw';

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: 'academic-content',
      resource_type: resourceType,
      public_id: file.originalname.replace(/\.[^/.]+$/, ''),
    };

    if (!isDocument) {
      uploadOptions.transformation = [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
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

    const stream = require('stream');
    const readableStream = new stream.PassThrough();
    readableStream.end(file.buffer);
    readableStream.pipe(uploadStream);
  });
}

export async function uploadLargeToCloudinary(file: UploadOptions): Promise<{ url: string; publicId: string }> {
  const resourceType = getResourceType(file.mimetype);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      file.buffer.toString('base64'),
      {
        folder: 'academic-content',
        resource_type: resourceType,
        public_id: file.originalname.replace(/\.[^/.]+$/, ''),
        chunk_size: 6000000,
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
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
