const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['Appartement', 'Studio', 'Villa', 'Chambre', 'Duplex', 'Bureau'],
  },
  rentPrice: {
    type: Number,
    required: [true, 'Rent price is required'],
    min: [5000, 'Rent must be at least 5,000 FCFA'],
  },
  quarter: {
    type: String,
    required: [true, 'Quarter is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    default: 'Yaoundé',
  },
  bedrooms: { type: Number, required: true, min: 1, max: 20 },
  bathrooms: { type: Number, required: true, min: 1, max: 10 },
  furnished: { type: Boolean, default: false },
  amenities: [{ type: String }],
  images: [{ type: String }],
  latitude: { type: Number },
  longitude: { type: Number },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  contactCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

// Index for search performance
propertySchema.index({ quarter: 1, rentPrice: 1, propertyType: 1, bedrooms: 1 });
propertySchema.index({ landlord: 1 });
propertySchema.index({ status: 1, isActive: 1 });
propertySchema.index({ latitude: 1, longitude: 1 });
propertySchema.index({ title: 'text', description: 'text', quarter: 'text' });

module.exports = mongoose.model('Property', propertySchema);
