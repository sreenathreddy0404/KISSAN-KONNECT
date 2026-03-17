const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createOrderFromBargain,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  recordPayment
} = require('../controllers/orderController');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// GET /api/orders - get user's orders
router.get('/', getUserOrders);

// POST /api/orders/from-bargain/:bargainId - create order from accepted bargain
// This could be called by either party? We'll restrict to farmer or buyer? For now, allow any authenticated user, but check inside controller.
router.post('/from-bargain/:bargainId', createOrderFromBargain);

// GET /api/orders/:id - get specific order
router.get('/:id', getOrderById);

// PATCH /api/orders/:id/status - update order status (farmer only)
router.patch('/:id/status', authorize('farmer'), updateOrderStatus);

// PATCH /api/orders/:id/payment - record payment (buyer only)
router.patch('/:id/payment', authorize('buyer'), recordPayment);

module.exports = router;