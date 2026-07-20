import { Request, Response } from 'express';
import Booking from '../models/Booking.js';

// Inline type to avoid circular dependency with authMiddleware
interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; role: string; avatar?: string };
}

// ── POST /api/bookings ─────────────────────────────────────────
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId, amount, stripeSessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!itemId || !amount || !stripeSessionId) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const newBooking = await Booking.create({
      userId,
      itemId,
      amount,
      stripeSessionId,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

// ── PATCH /api/bookings/success ────────────────────────────────
export const verifyBookingSuccess = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stripeSessionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!stripeSessionId) {
      res.status(400).json({ success: false, message: 'Missing session ID' });
      return;
    }

    const booking = await Booking.findOne({ stripeSessionId, userId }).populate('itemId');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'completed') {
      booking.status = 'completed';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Verify booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify booking' });
  }
};

// ── GET /api/bookings/my-bookings ──────────────────────────────
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Fetch all completed bookings and populate the item details
    const bookings = await Booking.find({ userId, status: 'completed' })
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// ── GET /api/bookings/provider-sales ───────────────────────────
export const getProviderSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // 1. Find all items owned by this provider
    const Item = (await import('../models/Item.js')).default;
    const providerItems = await Item.find({ instructor: userId }).select('_id');
    const itemIds = providerItems.map(item => item._id);

    // 2. Find all completed bookings for these items
    const bookings = await Booking.find({ itemId: { $in: itemIds }, status: 'completed' })
      .populate('itemId', 'title thumbnail category price')
      .sort({ createdAt: -1 })
      .lean();

    // 3. Fetch buyer details
    const User = (await import('../models/User.js')).default;
    const buyerIds = bookings.map(b => b.userId);
    const buyers = await User.find({ _id: { $in: buyerIds } }).select('_id name email avatar');

    // Create a map for quick lookup
    const buyerMap = buyers.reduce((acc: Record<string, any>, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // Attach buyer info to bookings
    const sales = bookings.map(b => ({
      ...b,
      buyer: buyerMap[b.userId] || { name: 'Unknown User', email: 'N/A' }
    }));

    res.status(200).json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error('Get provider sales error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales' });
  }
};
