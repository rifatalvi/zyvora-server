import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role || 'learner',
      avatar: (session.user as any).avatar || '',
    };
    next();
  } catch (error) {
    // Log actual error so it's visible in Vercel Function Logs
    console.error('[protect] Session check failed:', error);
    res.status(401).json({ success: false, message: 'Invalid session' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied, insufficient permissions' });
      return;
    }
    next();
  };
};
