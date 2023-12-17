import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables from .env file
config();

// Configure Cloudinary with the Cloudinary URL from the environment variables
cloudinary.config({
  CLOUDINARY_URL: process.env.CLOUDINARY_URL
});

export default cloudinary;
