import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from './authMiddleware';

// Attach full user document to the request after protect middleware
export const attachUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?.id) {
      const user = await User.findById(req.user.id).select('name avatar');
      if (user) {
        (req as any).userDoc = user;
        (req as any).userName = user.name;
        (req as any).userAvatar = user.avatar;
      }
    }
    next();
  } catch {
    next();
  }
};
