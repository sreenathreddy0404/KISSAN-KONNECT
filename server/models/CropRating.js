const mongoose = require('mongoose');

const cropRatingSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one rating per order per crop (though orderId is unique, this also prevents accidental duplicates)
cropRatingSchema.index({ cropId: 1, buyerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('CropRating', cropRatingSchema);