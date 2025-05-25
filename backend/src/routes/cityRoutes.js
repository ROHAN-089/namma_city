const express = require('express');
const router = express.Router();
const {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  addDepartment,
  removeDepartment,
  getNearCities
} = require('../controllers/cityController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadCityImage } = require('../config/cloudinary');

// Public routes
router.get('/', getCities);
router.get('/near', getNearCities);
router.get('/:id', getCityById);

// Admin routes
router.post('/', protect, admin, uploadCityImage.single('cityImage'), createCity);
router.route('/:id')
  .put(protect, admin, uploadCityImage.single('cityImage'), updateCity)
  .delete(protect, admin, deleteCity);

// Department routes
router.post('/:id/departments', protect, admin, addDepartment);
router.delete('/:id/departments/:departmentId', protect, admin, removeDepartment);

module.exports = router;
