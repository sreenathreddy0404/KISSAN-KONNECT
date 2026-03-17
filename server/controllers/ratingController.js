const CropRating = require('../models/CropRating');
const BuyerRating = require('../models/BuyerRating');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Rate a crop (by buyer after order completed)
// @route   POST /api/ratings/crop
// @access  Private (buyer only)
const rateCrop = async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid orderId and rating (1-5) required' });
    }

    // Fetch order and validate
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }
    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({ message: 'Order must be delivered or completed to rate' });
    }

    // Check if already rated this crop in this order
    const existing = await CropRating.findOne({ orderId, cropId: order.cropId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this crop for this order' });
    }

    // Create rating
    const ratingDoc = await CropRating.create({
      cropId: order.cropId,
      buyerId: req.user._id,
      buyerName: req.user.name,
      orderId: order._id,
      rating,
      review: review || ''
    });

    // Notify farmer about new rating
    await createNotification({
        userId: order.farmerId,
        title: 'New Crop Rating',
        message: `${req.user.name} rated your crop ${order.cropName} ${rating} stars`,
        type: 'rating',
        relatedId: ratingDoc._id
    });
    // Optionally update crop's average rating (we'll compute on the fly or store denormalized)
    // For now, just return the rating

    res.status(201).json(ratingDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a buyer (by farmer after order completed)
// @route   POST /api/ratings/buyer
// @access  Private (farmer only)
const rateBuyer = async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid orderId and rating (1-5) required' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to rate this buyer' });
    }
    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({ message: 'Order must be delivered or completed to rate' });
    }

    const existing = await BuyerRating.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this buyer for this order' });
    }

    const ratingDoc = await BuyerRating.create({
      buyerId: order.buyerId,
      farmerId: req.user._id,
      farmerName: req.user.name,
      orderId: order._id,
      rating,
      review: review || ''
    });

    // Notify buyer about new rating
    await createNotification({
        userId: order.buyerId,
        title: 'New Buyer Rating',
        message: `${req.user.name} rated you ${rating} stars for order #${order._id}`,
        type: 'rating',
        relatedId: ratingDoc._id
    });
    res.status(201).json(ratingDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ratings for a specific crop (public)
// @route   GET /api/ratings/crop/:cropId
// @access  Public
const getCropRatings = async (req, res) => {
  try {
    const ratings = await CropRating.find({ cropId: req.params.cropId }).sort({ createdAt: -1 });
    const average = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length || 0;
    res.json({
      ratings,
      average: Math.round(average * 10) / 10,
      count: ratings.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ratings for a specific buyer (public)
// @route   GET /api/ratings/buyer/:buyerId
// @access  Public
const getBuyerRatings = async (req, res) => {
  try {
    const ratings = await BuyerRating.find({ buyerId: req.params.buyerId }).sort({ createdAt: -1 });
    const average = ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length || 0;
    res.json({
      ratings,
      average: Math.round(average * 10) / 10,
      count: ratings.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ratings given by the logged-in user (as buyer or farmer)
// @route   GET /api/ratings/my
// @access  Private
const getMyRatings = async (req, res) => {
  try {
    let cropRatings = [], buyerRatings = [];
    if (req.user.role === 'buyer') {
      cropRatings = await CropRating.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'farmer') {
      buyerRatings = await BuyerRating.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    }
    res.json({ cropRatings, buyerRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  rateCrop,
  rateBuyer,
  getCropRatings,
  getBuyerRatings,
  getMyRatings
};