import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth.js';
import itemRoutes from './routes/itemRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import './models/User.js'; // Ensure User model is registered

const app = express();
const PORT = process.env.PORT || 5000;

// ── Database ───────────────────────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',').map(s => s.trim()) : []),
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Better Auth requires raw request parsing, so we place it before express.json()
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Zyvora API is running 🚀' });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/items', itemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);

// ── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Zyvora server running on http://localhost:${PORT}`);
  });
}

export default app;
