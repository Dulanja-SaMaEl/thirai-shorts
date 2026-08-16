import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import movieRoutes from './routes/movies.js';
import adminRoutes from './routes/admin.js';
import judgeRoutes from './routes/judge.js';
import voteRoutes from './routes/vote.js';
import stripeRoutes from './routes/stripe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup for Frontend Next.js integration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or any Vercel domain
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive CORS for deployed web app
    }
  },
  credentials: true
}));

// Body parser middleware (skip raw parsing for stripe webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', service: 'Thirai+ Express API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/stripe', stripeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Express Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🎬 Thirai+ Backend Server running on port ${PORT}`);
});
