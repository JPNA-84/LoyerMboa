require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/error');

// ── App setup ─────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// ── Connect DB ────────────────────────────────────────────
connectDB();

// ── Auto-create admin account ─────────────────────────────
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!exists) {
      await User.create({
        fullname: 'Admin LoyerMboa',
        email: process.env.ADMIN_EMAIL || 'admin@loyermboa.cm',
        phone: '+237670000000',
        passwordHash: process.env.ADMIN_PASSWORD || 'Admin@2024',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      console.log('✅ Admin account created:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin account already exists');
    }
  } catch (err) {
    console.error('❌ Admin seed error:', err.message);
  }
};

// Call it after DB connects
setTimeout(seedAdmin, 2000);

// ── Ensure upload dir exists ──────────────────────────────
const uploadPath = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Static uploads ────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(uploadPath)));

// ── API Routes ────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── 404 & Error handlers ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io (real-time notifications) ───────────────────
const connectedUsers = new Map(); // userId → socketId

io.on('connection', (socket) => {
  // User joins their own room
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`🔌 User ${userId} connected (${socket.id})`);
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of connectedUsers.entries()) {
      if (sid === socket.id) { connectedUsers.delete(uid); break; }
    }
  });
});

// Attach io to app so controllers can emit events
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 LoyerMboa API running on port ${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Docs: http://localhost:${PORT}/health\n`);
});

module.exports = { app, io };
