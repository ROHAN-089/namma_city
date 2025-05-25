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

const idProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    const resourceType = file.mimetype.includes('pdf') ? 'raw' : 'image';
    console.log('Uploading ID proof with resource type:', resourceType, 'mimetype:', file.mimetype);
    
    return {
      folder: 'city-reporter/id-proofs',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: resourceType,
      // Apply transformation only for images
      transformation: resourceType === 'image' ? [{ quality: 'auto:good' }] : []
    };
  }
});

const uploadIssueImage = multer({ storage: issueImagesStorage });
const uploadProfileImage = multer({ storage: profileImagesStorage });
const uploadCityImage = multer({ storage: cityImagesStorage });
const uploadIdProof = multer({ storage: idProofStorage });

module.exports = {
  cloudinary,
  uploadIssueImage,
  uploadProfileImage,
  uploadCityImage,
  uploadIdProof
};
