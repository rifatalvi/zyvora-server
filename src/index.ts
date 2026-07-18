import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Database ───────────────────────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Zyvora API is running 🚀' });
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// ── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Zyvora server running on http://localhost:${PORT}`);
});

export default app;
