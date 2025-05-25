const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const issueImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'city-reporter/issues',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const profileImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'city-reporter/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
});

const cityImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'city-reporter/cities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'fill' }]
  }
});

const uploadIssueImage = multer({ storage: issueImagesStorage });
const uploadProfileImage = multer({ storage: profileImagesStorage });
const uploadCityImage = multer({ storage: cityImagesStorage });

module.exports = {
  cloudinary,
  uploadIssueImage,
  uploadProfileImage,
  uploadCityImage
};
