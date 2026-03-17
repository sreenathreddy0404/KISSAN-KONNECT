const Bargain = require('../models/Bargain');
const Crop = require('../models/Crop');
const { createNotification } = require('./notificationController');

// @desc    Create a new bargain (initial offer)
// @route   POST /api/bargains
// @access  Private (Buyer only)
const createBargain = async (req, res) => {
  try {
    const { cropId, pricePerKg, quantityKg, message } = req.body;

    // Basic validation
    if (!cropId || !pricePerKg || !quantityKg) {
      return res.status(400).json({ message: 'cropId, pricePerKg, and quantityKg are required' });
    }

    // Fetch crop to get farmer details and validate
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    if (crop.farmerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot bargain on your own crop' });
    }
    if (crop.status !== 'active') {
      return res.status(400).json({ message: 'Crop is not available for bargaining' });
    }
    if (quantityKg < crop.minQuantityKg) {
      return res.status(400).json({ message: `Minimum quantity is ${crop.minQuantityKg} kg` });
    }
    if (quantityKg > crop.availableQuantityKg) {
      return res.status(400).json({ message: `Only ${crop.availableQuantityKg} kg available` });
    }

    // Check if there's already an active bargain for this buyer+crop
    const existing = await Bargain.findOne({
      cropId,
      buyerId: req.user._id,
      status: 'active'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active bargain on this crop' });
    }

    // Create the first message
    const totalPrice = pricePerKg * quantityKg;
    const newMessage = {
      sender: 'buyer',
      type: 'offer',
      pricePerKg,
      quantityKg,
      totalPrice,
      message: message || '',
      timestamp: new Date()
    };

    const bargain = await Bargain.create({
      cropId: crop._id,
      cropName: crop.name,
      cropImage: crop.image,
      buyerId: req.user._id,
      buyerName: req.user.name,
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      status: 'active',
      messages: [newMessage]
    });

    // Create a notification for the farmer
    await createNotification({
      userId: crop.farmerId,
      title: 'New Bargain Offer',
      message: `${req.user.name} made an offer on ${crop.name}`,
      type: 'bargain',
      relatedId: bargain._id
    });

    res.status(201).json(bargain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bargains for the logged-in user (buyer or farmer)
// @route   GET /api/bargains
// @access  Private
const getUserBargains = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'farmer') {
      query.farmerId = req.user._id;
    } else {
      // admin could see all, but for now return empty
      return res.json([]);
    }

    const bargains = await Bargain.find(query).sort({ updatedAt: -1 });
    res.json(bargains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single bargain by ID
// @route   GET /api/bargains/:id
// @access  Private (participants only)
const getBargainById = async (req, res) => {
  try {
    const bargain = await Bargain.findById(req.params.id);
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain not found' });
    }

    // Check if user is buyer or farmer of this bargain
    if (bargain.buyerId.toString() !== req.user._id.toString() &&
        bargain.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this bargain' });
    }

    res.json(bargain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a message to a bargain (offer, counter, accept, reject)
// @route   POST /api/bargains/:id/messages
// @access  Private (participants only)
const addMessage = async (req, res) => {
  try {
    const { type, pricePerKg, quantityKg, message } = req.body;
    const bargainId = req.params.id;

    const bargain = await Bargain.findById(bargainId);
    if (!bargain) {
      return res.status(404).json({ message: 'Bargain not found' });
    }

    // Check if user is a participant
    const isBuyer = bargain.buyerId.toString() === req.user._id.toString();
    const isFarmer = bargain.farmerId.toString() === req.user._id.toString();
    if (!isBuyer && !isFarmer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate bargain status
    if (bargain.status !== 'active') {
      return res.status(400).json({ message: `Bargain is already ${bargain.status}` });
    }

    // Validate sender role based on user
    const sender = isBuyer ? 'buyer' : 'farmer';

    // Validate message type based on sender
    if (type === 'offer' && sender !== 'buyer') {
      return res.status(400).json({ message: 'Only buyer can send an initial offer' });
    }
    if (type === 'counter' && !pricePerKg && !quantityKg) {
      return res.status(400).json({ message: 'Counter offer requires pricePerKg and/or quantityKg' });
    }
    if ((type === 'accept' || type === 'reject') && (pricePerKg || quantityKg)) {
      // Accept/reject messages shouldn't contain price/quantity changes
    }

    // Determine the price and quantity to store in the message
    let msgPrice = pricePerKg;
    let msgQty = quantityKg;
    let total = 0;

    // If not provided in the request, use the latest values from the last message
    if (!msgPrice || !msgQty) {
      const lastMsg = bargain.messages[bargain.messages.length - 1];
      msgPrice = msgPrice || lastMsg.pricePerKg;
      msgQty = msgQty || lastMsg.quantityKg;
    }
    total = msgPrice * msgQty;

    // Create new message
    const newMessage = {
      sender,
      type,
      pricePerKg: msgPrice,
      quantityKg: msgQty,
      totalPrice: total,
      message: message || '',
      timestamp: new Date()
    };

    // Special handling for accept/reject
    if (type === 'accept') {
      const crop = await Crop.findById(bargain.cropId);
      if (!crop) return res.status(404).json({ message: 'Crop not found' });
      if (crop.availableQuantityKg < msgQty) {
        return res.status(400).json({ message: `Only ${crop.availableQuantityKg} kg available` });
      }
      bargain.status = 'accepted';
      bargain.finalPrice = msgPrice;
      bargain.finalQuantity = msgQty;
      await createOrderFromBargain(bargain); // order created, no quantity reduction
    } else if (type === 'reject') {
      bargain.status = 'rejected';
    }

    bargain.messages.push(newMessage);
    await bargain.save();

    // Send notification to the other party
    const otherUserId = isBuyer ? bargain.farmerId : bargain.buyerId;
    const action = type === 'offer' ? 'made an offer' :
                  type === 'counter' ? 'sent a counteroffer' :
                  type === 'accept' ? 'accepted the bargain' : 'rejected the bargain';
    await createNotification({
      userId: otherUserId,
      title: `Bargain ${type}`,
      message: `${req.user.name} ${action} on ${bargain.cropName}`,
      type: 'bargain',
      relatedId: bargain._id
    });

    res.json(bargain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBargain,
  getUserBargains,
  getBargainById,
  addMessage
};