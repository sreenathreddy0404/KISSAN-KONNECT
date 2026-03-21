const Crop = require('../models/Crop');
const cloudinary = require('../config/cloudinary');

// @desc    Create a new crop
// @route   POST /api/crops
// @access  Private (Farmer only)
const createCrop = async (req, res) => {
  try {
    const { name, category, pricePerKg, minQuantityKg, availableQuantityKg, description, location, harvestDate } = req.body;

    // Validation
    if (!name || !category || !pricePerKg || !minQuantityKg || !availableQuantityKg || !description || !location || !harvestDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Crop image is required' });
    }

    const crop = await Crop.create({
      farmerId: req.user._id,
      farmerName: req.user.name,
      name,
      category,
      pricePerKg,
      minQuantityKg,
      availableQuantityKg,
      description,
      location,
      image: req.file.path, // Cloudinary URL
      harvestDate
    });

    res.status(201).json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all active crops (public)
// @route   GET /api/crops
// @access  Public
const getAllCrops = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, priceMin, priceMax, sort } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 10;
    const query = { status: 'active' };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      query.pricePerKg = {};
      if (priceMin !== undefined) query.pricePerKg.$gte = parseFloat(priceMin);
      if (priceMax !== undefined) query.pricePerKg.$lte = parseFloat(priceMax);
    }

    let sortOption = { createdAt: -1 }; // default sort
    if (sort) {
      switch (sort) {
        case 'price-low':
          sortOption = { pricePerKg: 1 };
          break;
        case 'price-high':
          sortOption = { pricePerKg: -1 };
          break;
        case 'qty-high':
          sortOption = { availableQuantityKg: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const crops = await Crop.find(query)
      .limit(lim)
      .skip((pageNum - 1) * lim)
      .sort(sortOption);

    const total = await Crop.countDocuments(query);

    res.json({
      crops,
      totalPages: Math.ceil(total / lim),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get farmer's own crops (private)
// @route   GET /api/crops/my-crops
// @access  Private (Farmer only)
const getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single crop by ID (public)
// @route   GET /api/crops/:id
// @access  Public
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a crop
// @route   PUT /api/crops/:id
// @access  Private (Farmer owner only)
const updateCrop = async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    // Check ownership
    if (crop.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    // If new image uploaded, update image field
    if (req.file) {
      req.body.image = req.file.path;
      // delete old image from Cloudinary
      // extract public_id from image URL
      const publicId = crop.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`kissan_konnect/crops/${publicId}`);
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(crop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private (Farmer owner only)
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    // delete image from Cloudinary
    // Extract public_id from URL and delete using cloudinary.uploader.destroy
    const publicId = crop.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`kissan_konnect/crops/${publicId}`);

    await crop.deleteOne();
    res.json({ message: 'Crop removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Pause/Unpause a crop (toggle status)
// @route   PATCH /api/crops/:id/pause
// @access  Private (Farmer owner only)
const togglePauseCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    crop.status = crop.status === 'active' ? 'inactive' : 'active';
    await crop.save();
    res.json({ message: `Crop ${crop.status === 'active' ? 'activated' : 'paused'} successfully`, status: crop.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCrop,
  getAllCrops,
  getMyCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  togglePauseCrop
};