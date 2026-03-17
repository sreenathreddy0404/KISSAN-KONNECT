const mongoose = require('mongoose');

const buyerRatingSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

buyerRatingSchema.index({ buyerId: 1, farmerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('BuyerRating', buyerRatingSchema);