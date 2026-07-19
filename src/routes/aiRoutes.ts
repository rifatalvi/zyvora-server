import { Router } from 'express';
import { generateContent, getRecommendations, chatWithJarvis } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Protect both routes so only authenticated users can use the AI
router.post('/generate-content', protect, generateContent);
router.get('/recommendations', protect, getRecommendations);
router.post('/chat', chatWithJarvis); // Public chat route

export default router;
