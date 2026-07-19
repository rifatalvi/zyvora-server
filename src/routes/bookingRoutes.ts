import { Router, Request, Response, NextFunction } from 'express';
import { createBooking, verifyBookingSuccess, getMyBookings, getProviderSales } from '../controllers/bookingController.js';

const router = Router();

// Lazy auth guard: resolves `protect` at request-time to avoid module load-order issues
const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const { protect } = await import('../middleware/authMiddleware');
  return protect(req as any, res, next);
};

const providerGuard = async (req: Request, res: Response, next: NextFunction) => {
  const { restrictTo } = await import('../middleware/authMiddleware');
  return restrictTo('provider')(req as any, res, next);
};

// POST /api/bookings
router.post('/', authGuard, createBooking);

// PATCH /api/bookings/success
router.patch('/success', authGuard, verifyBookingSuccess);

// GET /api/bookings/my-bookings
router.get('/my-bookings', authGuard, getMyBookings);

// GET /api/bookings/provider-sales
router.get('/provider-sales', authGuard, providerGuard, getProviderSales);

export default router;
