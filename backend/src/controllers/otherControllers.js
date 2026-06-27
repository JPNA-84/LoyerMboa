const { Favorite, Review, Message } = require('../models/other');
const Property = require('../models/Property');

// ── FAVORITES ────────────────────────────────────────────

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({ path: 'property', populate: { path: 'landlord', select: 'fullname phone' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: favorites.map(f => f.property).filter(Boolean) });
  } catch (err) { next(err); }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const existing = await Favorite.findOne({ user: req.user._id, property: propertyId });
    if (existing) return res.status(409).json({ success: false, message: 'Already in favorites' });

    await Favorite.create({ user: req.user._id, property: propertyId });
    res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (err) { next(err); }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const result = await Favorite.findOneAndDelete({
      user: req.user._id, property: req.params.propertyId
    });
    if (!result) return res.status(404).json({ success: false, message: 'Favorite not found' });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) { next(err); }
};

// ── REVIEWS ──────────────────────────────────────────────

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('tenant', 'fullname avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) { next(err); }
};

exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ success: false, message: 'Only tenants can review' });
    }
    const existing = await Review.findOne({ property: req.params.propertyId, tenant: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({
      property: req.params.propertyId,
      tenant: req.user._id,
      rating: parseInt(rating),
      comment,
    });
    await review.populate('tenant', 'fullname avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

// ── MESSAGES ─────────────────────────────────────────────

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      thread: null,
    })
      .populate('sender', 'fullname avatar')
      .populate('recipient', 'fullname avatar')
      .populate('property', 'title quarter')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const property = await Property.findById(req.params.propertyId).populate('landlord');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const message = await Message.create({
      property: property._id,
      sender: req.user._id,
      recipient: property.landlord._id,
      content,
    });

    await Property.findByIdAndUpdate(property._id, { $inc: { contactCount: 1 } });

    await message.populate('sender', 'fullname avatar');
    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) { next(err); }
};
exports.replyMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const original = await Message.findById(req.params.messageId)
      .populate('sender', 'fullname')
      .populate('recipient', 'fullname');

    if (!original) return res.status(404).json({ success: false, message: 'Message not found' });

    const recipient = original.sender._id.toString() === req.user._id.toString()
      ? original.recipient._id
      : original.sender._id;

    const reply = await Message.create({
      property: original.property,
      sender: req.user._id,
      recipient,
      content,
      thread: original._id,
    });

    await reply.populate('sender', 'fullname avatar');

    const io = req.app.get('io');
    if (io) io.to(`user:${recipient}`).emit('new_message', { message: reply });

    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
};
exports.getThread = async (req, res, next) => {
  try {
    const replies = await Message.find({ thread: req.params.messageId })
      .populate('sender', 'fullname avatar')
      .populate('recipient', 'fullname avatar')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: replies });
  } catch (err) { next(err); }
};