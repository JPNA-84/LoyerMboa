const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

const authCtrl = require('../controllers/authController');
const propCtrl = require('../controllers/propertyController');
const otherCtrl = require('../controllers/otherControllers');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/error');

const router = express.Router();

// ── MULTER (file uploads) ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || './uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

// ── RATE LIMITS ──────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });
const generalLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 100 });

// ── AUTH ROUTES ──────────────────────────────────────────
router.post('/auth/register', authLimiter, [
  body('fullname').trim().notEmpty().withMessage('Full name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], validate, authCtrl.register);

router.post('/auth/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, authCtrl.login);

router.post('/auth/logout', protect, authCtrl.logout);
router.get('/auth/profile', protect, authCtrl.getProfile);
router.put('/auth/profile', protect, authCtrl.updateProfile);
router.put('/auth/password', protect, authCtrl.changePassword);

// ── PROPERTY ROUTES ───────────────────────────────────────
router.get('/properties', generalLimiter, propCtrl.getProperties);
router.get('/properties/search', generalLimiter, propCtrl.searchProperties);
router.get('/properties/my-properties', protect, authorize('landlord', 'admin'), propCtrl.getMyProperties);
router.get('/properties/:id', optionalAuth, propCtrl.getProperty);

router.post('/properties', protect, authorize('landlord'), upload.array('images', 8), [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('rentPrice').isInt({ min: 1000 }),
  body('propertyType').notEmpty(),
  body('quarter').notEmpty(),
  body('bedrooms').isInt({ min: 1 }),
  body('bathrooms').isInt({ min: 1 }),
], validate, propCtrl.createProperty);

router.put('/properties/:id', protect, authorize('landlord', 'admin'), propCtrl.updateProperty);
router.delete('/properties/:id', protect, authorize('landlord', 'admin'), propCtrl.deleteProperty);
router.put('/properties/:id/verify', protect, authorize('admin'), propCtrl.verifyProperty);

// ── FAVORITE ROUTES ───────────────────────────────────────
router.get('/favorites', protect, authorize('tenant'), otherCtrl.getFavorites);
router.post('/favorites', protect, authorize('tenant'), [
  body('propertyId').notEmpty(),
], validate, otherCtrl.addFavorite);
router.delete('/favorites/:propertyId', protect, authorize('tenant'), otherCtrl.removeFavorite);

// ── REVIEW ROUTES ─────────────────────────────────────────
router.get('/reviews/:propertyId', otherCtrl.getReviews);
router.post('/reviews/:propertyId', protect, authorize('tenant'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().notEmpty(),
], validate, otherCtrl.createReview);

// ── MESSAGE ROUTES ────────────────────────────────────────
router.get('/messages', protect, otherCtrl.getMessages);
router.post('/contact/:propertyId', protect, authorize('tenant'), [
  body('content').trim().notEmpty().isLength({ max: 2000 }),
], validate, otherCtrl.sendMessage);
router.put('/messages/read', protect, otherCtrl.markRead);
router.post('/messages/reply/:messageId', protect, otherCtrl.replyMessage);
router.get('/messages/thread/:messageId', protect, otherCtrl.getThread);
module.exports = router;
