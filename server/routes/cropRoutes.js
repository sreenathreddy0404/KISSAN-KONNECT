const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createCrop,
  getAllCrops,
  getMyCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  togglePauseCrop
} = require('../controllers/cropController');

const router = express.Router();

// Public routes
router.get('/', getAllCrops);
router.get('/one/:id', getCropById);

// Protected routes (farmer only)
router.use(protect); // all routes after this require authentication
router.use(authorize('farmer')); // all routes after this require farmer role

router.get('/my-crops', getMyCrops);
router.post('/', upload.single('image'), createCrop);
router.put('/:id', upload.single('image'), updateCrop);
router.delete('/:id', deleteCrop);
router.patch('/:id/pause', togglePauseCrop);

module.exports = router;