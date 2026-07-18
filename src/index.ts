import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './config/auth';
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

// ── Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Zyvora server running on http://localhost:${PORT}`);
});

export default app;
