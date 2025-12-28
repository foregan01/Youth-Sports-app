import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import db from '../db';
import { UserRole } from '@teambudget/shared';

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  };
  teamRole?: UserRole;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    const user = db
      .prepare('SELECT id, email, first_name, last_name FROM users WHERE id = ?')
      .get(payload.userId) as { id: string; email: string; first_name: string; last_name: string } | undefined;

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireTeamAccess(allowedRoles?: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const teamId = req.params.teamId || req.body.teamId;

    if (!teamId) {
      res.status(400).json({ success: false, error: 'Team ID required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const membership = db
      .prepare(
        'SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1'
      )
      .get(teamId, req.user.id) as { role: UserRole } | undefined;

    if (!membership) {
      res.status(403).json({ success: false, error: 'Not a member of this team' });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    req.teamRole = membership.role;
    next();
  };
}

export function requireTreasurer(req: AuthRequest, res: Response, next: NextFunction): void {
  requireTeamAccess(['treasurer', 'admin'])(req, res, next);
}
