const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createBargain,
  getUserBargains,
  getBargainById,
  addMessage
} = require('../controllers/bargainController');

const router = express.Router();

// All bargain routes require authentication
router.use(protect);

// GET /api/bargains - get all bargains for the logged-in user
router.get('/', getUserBargains);

// POST /api/bargains - create a new bargain (buyer only)
router.post('/', authorize('buyer'), createBargain);

// GET /api/bargains/:id - get a specific bargain
router.get('/:id', getBargainById);

// POST /api/bargains/:id/messages - add a message to a bargain
router.post('/:id/messages', addMessage);

module.exports = router;