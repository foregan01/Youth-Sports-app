import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../db';
import { config } from '../config';
import { authenticate, AuthRequest, JwtPayload } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to generate tokens
function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ userId, email } as JwtPayload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Store refresh token
  db.prepare(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).run(uuidv4(), userId, refreshToken, expiresAt.toISOString());

  return { accessToken, refreshToken, expiresIn: 604800 }; // 7 days in seconds
}

// POST /api/auth/register
router.post('/register', async (req, res: Response, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const userId = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, data.email, passwordHash, data.firstName, data.lastName, data.phone || null);

    // Generate tokens
    const tokens = generateTokens(userId, data.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = db
      .prepare('SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?')
      .get(data.email) as {
      id: string;
      email: string;
      password_hash: string;
      first_name: string;
      last_name: string;
    } | undefined;

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res: Response, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Find refresh token
    const tokenRecord = db
      .prepare('SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?')
      .get(refreshToken) as { user_id: string; expires_at: string } | undefined;

    if (!tokenRecord) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
      throw new AppError('Refresh token expired', 401);
    }

    // Get user
    const user = db
      .prepare('SELECT id, email, first_name, last_name FROM users WHERE id = ?')
      .get(tokenRecord.user_id) as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
    } | undefined;

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Delete old refresh token
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
  }

  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  // Get user's teams
  const teams = db
    .prepare(
      `SELECT t.id, t.name, t.sport, t.season, tm.role
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ? AND tm.is_active = 1`
    )
    .all(req.user!.id) as { id: string; name: string; sport: string; season: string; role: string }[];

  res.json({
    success: true,
    data: {
      ...req.user,
      teams,
    },
  });
});

export default router;
