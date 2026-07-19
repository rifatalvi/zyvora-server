import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware.js';

// The protect middleware already retrieves the user via better-auth
// We can just alias properties for backward compatibility with existing routes if needed
export const attachUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user) {
    (req as any).userName = req.user.name;
    (req as any).userAvatar = req.user.avatar;
    // req.userDoc is no longer a mongoose document, it's just the plain user object
    (req as any).userDoc = req.user;
  }
  next();
};
