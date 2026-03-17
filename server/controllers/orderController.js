const Order = require('../models/Order');
const Crop = require('../models/Crop');
const Bargain = require('../models/Bargain');
const { createNotification } = require('./notificationController');

// Helper to calculate advance (15% of total)
const calculateAdvance = (total) => Math.round(total * 0.15);

// @desc    Create order from an accepted bargain
// @route   POST /api/orders/from-bargain/:bargainId
// @access  Private (Farmer or Buyer? Actually called internally when bargain accepted)
// We'll make it internal (no route) but for flexibility, expose as POST with validation.
const createOrderFromBargain = async (bargain) => {
  try {
    const buyer = await User.findById(bargain.buyerId);
    if (!buyer) throw new Error('Buyer not found');
    const address = `${buyer.address.street}, ${buyer.address.landmark}, ${buyer.address.city}, ${buyer.address.state} ${buyer.address.pincode}`;

    const totalPrice = bargain.finalPrice * bargain.finalQuantity;

    // Check if order already exists
    const existingOrder = await Order.findOne({ bargainId: bargain._id });
    if (existingOrder) return;

    const order = await Order.create({
      bargainId: bargain._id,
      cropId: bargain.cropId,
      cropName: bargain.cropName,
      cropImage: bargain.cropImage,
      buyerId: bargain.buyerId,
      buyerName: bargain.buyerName,
      farmerId: bargain.farmerId,
      farmerName: bargain.farmerName,
      pricePerKg: bargain.finalPrice,
      quantityKg: bargain.finalQuantity,
      totalPrice,
      advancePaid: 0,
      remainingAmount: totalPrice,
      status: 'pending_payment',
      address
    });

    // Notify buyer about order creation
    await createNotification({
        userId: bargain.buyerId,
        title: 'Order Created',
        message: `Your order for ${bargain.cropName} has been created. Please pay advance.`,
        type: 'order',
        relatedId: order._id
    });

    console.log(`Order created: ${order._id}`);
  } catch (error) {
    console.error('Failed to create order from bargain:', error);
  }
};

// @desc    Get all orders for the logged-in user
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'farmer') {
      query.farmerId = req.user._id;
    } else {
      // admin could see all
      return res.json([]);
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (participants only)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Check if user is buyer or farmer of this order
    if (order.buyerId.toString() !== req.user._id.toString() &&
        order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (farmer only)
// @route   PATCH /api/orders/:id/status
// @access  Private (Farmer owner only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the farmer can update status' });
    }

    // Optional: validate status transition (e.g., cannot go back)
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    await order.save();

    // Notify buyer
    await createNotification({
        userId: order.buyerId,
        title: 'Order Status Updated',
        message: `Your order #${order._id} is now ${status}`,
        type: 'order',
        relatedId: order._id
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Record payment (advance or full)
// @route   PATCH /api/orders/:id/payment
// @access  Private (Buyer only)
const recordPayment = async (req, res) => {
  try {
    const { amount, type } = req.body; // 'advance', 'full', 'remaining'
    if (!amount || amount <= 0 || !type) {
      return res.status(400).json({ message: 'Valid amount and type required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only buyer can record payment' });
    }

    const total = order.totalPrice;
    const expectedAdvance = Math.round(total * 0.15);

    if (type === 'advance') {
      if (order.status !== 'pending_payment') {
        return res.status(400).json({ message: 'Order not awaiting advance' });
      }
      if (order.advancePaid > 0) {
        return res.status(400).json({ message: 'Advance already paid' });
      }
      if (amount < expectedAdvance) {
        return res.status(400).json({ message: `Advance must be at least ${expectedAdvance}` });
      }

      // Update order
      order.advancePaid = amount;
      order.remainingAmount = total - amount;
      order.status = 'confirmed';

      // Reduce crop quantity
      const crop = await Crop.findById(order.cropId);
      if (!crop) return res.status(404).json({ message: 'Crop not found' });
      if (crop.availableQuantityKg < order.quantityKg) {
        return res.status(400).json({ message: 'Insufficient crop quantity' });
      }
      crop.availableQuantityKg -= order.quantityKg;
      if (crop.availableQuantityKg === 0) crop.status = 'inactive';
      await crop.save();

    } else if (type === 'full') {
      // Pay entire amount at once (optional)
      if (order.status !== 'pending_payment') {
        return res.status(400).json({ message: 'Order not awaiting payment' });
      }
      if (amount < total) {
        return res.status(400).json({ message: `Full payment must be at least ${total}` });
      }
      order.advancePaid = total;
      order.remainingAmount = 0;
      order.status = 'confirmed';

      const crop = await Crop.findById(order.cropId);
      if (!crop) return res.status(404).json({ message: 'Crop not found' });
      if (crop.availableQuantityKg < order.quantityKg) {
        return res.status(400).json({ message: 'Insufficient crop quantity' });
      }
      crop.availableQuantityKg -= order.quantityKg;
      if (crop.availableQuantityKg === 0) crop.status = 'inactive';
      await crop.save();

    } else if (type === 'remaining') {
      // Pay remaining 85% after delivery
      if (order.status !== 'delivered') {
        return res.status(400).json({ message: 'Remaining payment only after delivery' });
      }
      if (order.advancePaid === 0) {
        return res.status(400).json({ message: 'Advance not paid yet' });
      }
      const remaining = total - order.advancePaid;
      if (amount < remaining) {
        return res.status(400).json({ message: `Remaining amount is ${remaining}` });
      }
      order.advancePaid = total; // or track full payment separately
      order.remainingAmount = 0;
      order.status = 'completed';
    } else {
      return res.status(400).json({ message: 'Invalid payment type' });
    }

    await order.save();

    // Notify buyer
    const paymentTypeMsg = type === 'advance' ? 'Advance payment' : 'Full payment';
    await createNotification({
        userId: order.farmerId,
        title: 'Payment Received',
        message: `${paymentTypeMsg} received for order #${order._id}`,
        type: 'order',
        relatedId: order._id
    });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrderFromBargain,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  recordPayment
};