const mongoose = require('mongoose');

const orderStatusEnum = [
  'pending_payment',
  'confirmed',
  'packing',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'completed' 
];

const orderSchema = new mongoose.Schema({
  bargainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bargain' }, // optional, if created from bargain
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  cropName: { type: String, required: true },
  cropImage: { type: String, required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantityKg: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  status: { type: String, enum: orderStatusEnum, default: 'pending_payment' },
  address: { type: String, required: true }, // shipping address from buyer's profile or order-specific
  paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' }, // optional
  deliveredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);