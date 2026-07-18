import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUser } from '../models/User';

// ── JWT Utilities ──────────────────────────────────────────────
export const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN as string) || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as jwt.JwtPayload;
};

// ── Password Hashing (Node.js native crypto) ──────────────────
export const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const comparePassword = (password: string, storedHash: string): boolean => {
  const [salt, hash] = storedHash.split(':');
  const inputHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return inputHash === hash;
};

// ── User Sanitizer (strip sensitive fields) ───────────────────
export const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  bio: user.bio,
  skills: user.skills,
  interests: user.interests,
  createdAt: user.createdAt,
});
