const mongoose = require('mongoose');

// ── Favorite ─────────────────────────────────────────────
const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: true });

favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

// ── Review ───────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

reviewSchema.index({ property: 1, tenant: 1 }, { unique: true });

// Update property average rating after save
reviewSchema.post('save', async function () {
  const Property = mongoose.model('Property');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { property: this.property } },
    { $group: { _id: '$property', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Property.findByIdAndUpdate(this.property, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

// ── Message ──────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isRead: { type: Boolean, default: false },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
}, { timestamps: true });

messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ property: 1 });

module.exports = {
  Favorite: mongoose.model('Favorite', favoriteSchema),
  Review: mongoose.model('Review', reviewSchema),
  Message: mongoose.model('Message', messageSchema),
};
