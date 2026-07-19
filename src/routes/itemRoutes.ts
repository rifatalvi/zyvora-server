import { Router } from 'express';
import {
  createItem,
  getItems,
  getItemById,
  deleteItem,
  getMyItems,
  addReview,
} from '../controllers/itemController';
import { protect } from '../middleware/authMiddleware.js';
import { attachUser } from '../middleware/attachUser.js';

const router = Router();

// ── Public routes ──────────────────────────────────────────────
router.get('/', getItems);
router.get('/my', protect, getMyItems);           // Must come before /:id
router.get('/:id', getItemById);

// ── Protected routes ───────────────────────────────────────────
router.post('/', protect, attachUser, createItem);
router.delete('/:id', protect, deleteItem);
router.post('/:id/review', protect, attachUser, addReview);

export default router;
