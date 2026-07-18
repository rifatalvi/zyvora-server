import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken, hashPassword, comparePassword, sanitizeUser } from '../utils/auth';

// ── POST /api/auth/register ────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email is already registered' });
      return;
    }

    const hashedPassword = hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'learner',
      provider: 'local',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ── POST /api/auth/google ──────────────────────────────────────
// This endpoint receives the Google ID token from the frontend
// and creates/fetches the user from the database.
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, avatar, googleId } = req.body;

    if (!name || !email || !googleId) {
      res.status(400).json({ success: false, message: 'Missing Google auth credentials' });
      return;
    }

    // Find existing user or create new one
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        avatar,
        provider: 'google',
        providerId: googleId,
        role: 'learner',
      });
    } else if (user.provider === 'local') {
      // Link Google to existing local account
      user.provider = 'google';
      user.providerId = googleId;
      if (avatar) user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google auth' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
