const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['buyer', 'farmer'], required: true },
  type: { type: String, enum: ['offer', 'counter', 'accept', 'reject'], required: true },
  pricePerKg: { type: Number, required: true, min: 0 },
  quantityKg: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  message: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: true }); // each message gets its own _id

const bargainSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  cropName: { type: String, required: true }, // denormalized for quick access
  cropImage: { type: String, required: true }, // denormalized
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true }, // denormalized
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true }, // denormalized
  status: { type: String, enum: ['active', 'accepted', 'rejected'], default: 'active' },
  messages: [messageSchema],
  finalPrice: { type: Number },
  finalQuantity: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Bargain', bargainSchema);