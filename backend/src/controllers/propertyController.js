const Property = require('../models/Property');
const { Favorite } = require('../models/other');

// @route GET /api/properties
exports.getProperties = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Admin can filter by any status, public only sees verified
    const statusFilter = req.query.status;
    const query = statusFilter
  ? { status: statusFilter, isActive: true }
  : { status: 'verified', isActive: true };
console.log('🔍 getProperties query:', JSON.stringify(query), 'statusFilter:', statusFilter);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('landlord', 'fullname phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/properties/search
exports.searchProperties = async (req, res, next) => {
  try {
    const { quarter, minPrice, maxPrice, bedrooms, propertyType, furnished, city, q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = { status: 'verified', isActive: true };

    if (quarter) query.quarter = { $regex: quarter, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (furnished !== undefined) query.furnished = furnished === 'true';
    if (bedrooms) query.bedrooms = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = parseInt(minPrice);
      if (maxPrice) query.rentPrice.$lte = parseInt(maxPrice);
    }
    if (q) query.$text = { $search: q };

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('landlord', 'fullname phone email')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/properties/my-properties
exports.getMyProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ landlord: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/properties/:id
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'fullname phone email avatar');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment view count
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Check if user favorited this
    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.findOne({ user: req.user._id, property: property._id });
      isFavorited = !!fav;
    }

    res.json({ success: true, data: { ...property.toObject(), isFavorited } });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/properties
exports.createProperty = async (req, res, next) => {
  try {
    const propertyData = { ...req.body, landlord: req.user._id };

// Handle uploaded images
if (req.files && req.files.length > 0) {
  propertyData.images = req.files.map(f => f.path);
}

    const property = await Property.create(propertyData);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/properties/:id
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Re-verify on price/quarter change
    const needsReview = req.body.rentPrice !== undefined || req.body.quarter !== undefined;
    if (needsReview && property.status === 'verified') {
      req.body.status = 'pending';
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/properties/:id
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.landlord.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/properties/:id/verify  (admin)
exports.verifyProperty = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const property = await Property.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};
