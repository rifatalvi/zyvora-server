import { Router } from 'express';
import { generateContent, getRecommendations } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect both routes so only authenticated users can use the AI
router.post('/generate-content', protect, generateContent);
router.get('/recommendations', protect, getRecommendations);

export default router;
