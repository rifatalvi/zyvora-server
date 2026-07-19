import { Request, Response } from 'express';
import Item from '../models/Item.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// ── POST /api/items — Create Item (Protected) ──────────────────
export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      type,
      difficulty,
      price,
      thumbnail,
      images,
      tags,
      duration,
      language,
      aiGenerated,
    } = req.body;

    if (!title || !shortDescription || !fullDescription || !category || price === undefined || !thumbnail) {
      res.status(400).json({
        success: false,
        message: 'Title, descriptions, category, price, and thumbnail are required',
      });
      return;
    }

    const item = await Item.create({
      title,
      shortDescription,
      fullDescription,
      category,
      type: type || 'course',
      difficulty: difficulty || 'Beginner',
      price: Number(price),
      thumbnail,
      images: images || [],
      tags: tags || [],
      instructor: req.user!.id,
      instructorName: (req as any).userDoc?.name || 'Unknown',
      instructorAvatar: (req as any).userDoc?.avatar || '',
      duration: duration || 'Self-paced',
      language: language || 'English',
      aiGenerated: aiGenerated || false,
    });

    // Re-query to populate instructor name
    const populatedItem = await Item.findById(item._id).populate('instructor', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: populatedItem,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, message: 'Server error creating item' });
  }
};

// ── GET /api/items — Get All Items with Search/Filter/Sort/Pagination (Public) ──
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search = '',
      category = '',
      type = '',
      difficulty = '',
      minPrice = '0',
      maxPrice = '99999',
      minRating = '0',
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    // Build filter object
    const filter: Record<string, any> = { isPublished: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    filter.price = {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    };

    if (Number(minRating) > 0) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'price', 'averageRating', 'totalEnrolled'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('instructor', 'name avatar'),
      Item.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching items' });
  }
};

// ── GET /api/items/:id — Get Single Item (Public) ─────────────
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('instructor', 'name avatar bio');

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Get related items (same category, excluding self)
    const related = await Item.find({
      category: item.category,
      _id: { $ne: item._id },
      isPublished: true,
    })
      .limit(4)
      .select('title shortDescription price thumbnail averageRating totalReviews category');

    res.status(200).json({ success: true, item, related });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching item' });
  }
};

// ── DELETE /api/items/:id — Delete Item (Protected, owner only) ─
export const deleteItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Ensure the requesting user owns this item
    if (item.instructor.toString() !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
      return;
    }

    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting item' });
  }
};

// ── GET /api/items/my — Get Current User's Items (Protected) ───
export const getMyItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Item.find({ instructor: req.user!.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching your items' });
  }
};

// ── POST /api/items/:id/review — Add Review (Protected) ────────
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      res.status(400).json({ success: false, message: 'Rating and comment are required' });
      return;
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Check duplicate review
    const alreadyReviewed = item.reviews.find((r) => r.user.toString() === req.user!.id);
    if (alreadyReviewed) {
      res.status(409).json({ success: false, message: 'You have already reviewed this item' });
      return;
    }

    const review = {
      user: req.user!.id as unknown as import('mongoose').Types.ObjectId,
      userName: (req as any).userName || 'User',
      userAvatar: (req as any).userAvatar || '',
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    item.reviews.push(review);
    item.totalReviews = item.reviews.length;
    item.averageRating =
      Math.round(
        (item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length) * 10
      ) / 10;

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      averageRating: item.averageRating,
      totalReviews: item.totalReviews,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error adding review' });
  }
};
