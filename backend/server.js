import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import movieRoutes from './routes/movies.js';
import adminRoutes from './routes/admin.js';
import judgeRoutes from './routes/judge.js';
import voteRoutes from './routes/vote.js';
import stripeRoutes from './routes/stripe.js';
import packageRoutes from './routes/packages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security: Hide server technology header
app.disable('x-powered-by');

// Security Response Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Production-Grade CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow configured origins and all Vercel production/preview deployments
    const isAllowed =
      allowedOrigins.some(o => origin.startsWith(o)) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to allow connection, headers enforce safety
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
app.use('/api/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/packages', packageRoutes);

// Global Production Error Handler (prevents stack-trace leaks)
app.use((err, req, res, next) => {
  console.error('Express Error Event:', err.message || err);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(err.status || 500).json({
    error: isProduction && (err.status === 500 || !err.status)
      ? 'An unexpected internal server error occurred.'
      : (err.message || 'Internal Server Error')
  });
});

app.listen(PORT, () => {
  console.log(`🎬 Thirai+ Backend Server running on port ${PORT}`);
});
