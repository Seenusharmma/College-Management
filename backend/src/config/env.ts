import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-content-system',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production'
};
