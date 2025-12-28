import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../db';
import { authenticate, requireTeamAccess, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { SportType, UserRole } from '@teambudget/shared';

const router = Router();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  sport: z.string(),
  season: z.string().min(1, 'Season is required'),
  ageGroup: z.string().optional(),
  currency: z.string().default('USD'),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['treasurer', 'coach', 'parent']),
});

// GET /api/teams - Get user's teams
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const teams = db
    .prepare(
      `SELECT t.*, tm.role as user_role,
        (SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
         FROM transactions WHERE team_id = t.id AND status = 'completed') as balance
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = ? AND tm.is_active = 1
       ORDER BY t.created_at DESC`
    )
    .all(req.user!.id);

  res.json({ success: true, data: teams });
});

// POST /api/teams - Create a new team
router.post('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const data = createTeamSchema.parse(req.body);
    const teamId = uuidv4();

    // Create team
    db.prepare(`
      INSERT INTO teams (id, name, sport, season, age_group, currency)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(teamId, data.name, data.sport, data.season, data.ageGroup || null, data.currency);

    // Add creator as treasurer
    db.prepare(`
      INSERT INTO team_members (id, team_id, user_id, role)
      VALUES (?, ?, ?, 'treasurer')
    `).run(uuidv4(), teamId, req.user!.id);

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId - Get team details
router.get('/:teamId', authenticate, requireTeamAccess(), (req: AuthRequest, res: Response) => {
  const team = db
    .prepare(
      `SELECT t.*,
        (SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0)
         FROM transactions WHERE team_id = t.id AND status = 'completed') as balance
       FROM teams t WHERE t.id = ?`
    )
    .get(req.params.teamId);

  if (!team) {
    throw new AppError('Team not found', 404);
  }

  // Get team members
  const members = db
    .prepare(
      `SELECT tm.id, tm.role, tm.joined_at, tm.is_active,
        u.id as user_id, u.email, u.first_name, u.last_name
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?`
    )
    .all(req.params.teamId);

  res.json({ success: true, data: { ...team, members } });
});

// PUT /api/teams/:teamId - Update team
router.put(
  '/:teamId',
  authenticate,
  requireTeamAccess(['treasurer', 'admin']),
  (req: AuthRequest, res: Response, next) => {
    try {
      const data = createTeamSchema.partial().parse(req.body);

      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (data.name) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.sport) {
        updates.push('sport = ?');
        values.push(data.sport);
      }
      if (data.season) {
        updates.push('season = ?');
        values.push(data.season);
      }
      if (data.ageGroup !== undefined) {
        updates.push('age_group = ?');
        values.push(data.ageGroup);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.teamId);

        db.prepare(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }

      const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.teamId);

      res.json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/teams/:teamId/members - Invite member to team
router.post(
  '/:teamId/members',
  authenticate,
  requireTeamAccess(['treasurer', 'admin']),
  (req: AuthRequest, res: Response, next) => {
    try {
      const data = inviteMemberSchema.parse(req.body);

      // Find user by email
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email) as
        | { id: string }
        | undefined;

      if (!user) {
        throw new AppError('User not found. They must register first.', 404);
      }

      // Check if already a member
      const existing = db
        .prepare('SELECT id FROM team_members WHERE team_id = ? AND user_id = ?')
        .get(req.params.teamId, user.id);

      if (existing) {
        throw new AppError('User is already a team member', 400);
      }

      // Add member
      const memberId = uuidv4();
      db.prepare(`
        INSERT INTO team_members (id, team_id, user_id, role)
        VALUES (?, ?, ?, ?)
      `).run(memberId, req.params.teamId, user.id, data.role);

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: { id: memberId, userId: user.id, role: data.role },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/teams/:teamId/members/:memberId - Remove member
router.delete(
  '/:teamId/members/:memberId',
  authenticate,
  requireTeamAccess(['treasurer', 'admin']),
  (req: AuthRequest, res: Response) => {
    const result = db
      .prepare('UPDATE team_members SET is_active = 0 WHERE id = ? AND team_id = ?')
      .run(req.params.memberId, req.params.teamId);

    if (result.changes === 0) {
      throw new AppError('Member not found', 404);
    }

    res.json({ success: true, message: 'Member removed successfully' });
  }
);

// GET /api/teams/:teamId/dashboard - Get dashboard data
router.get(
  '/:teamId/dashboard',
  authenticate,
  requireTeamAccess(),
  (req: AuthRequest, res: Response) => {
    const teamId = req.params.teamId;

    // Get balance
    const balanceResult = db
      .prepare(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count
         FROM transactions WHERE team_id = ?`
      )
      .get(teamId) as { total_income: number; total_expenses: number; pending_count: number };

    // Get recent transactions
    const recentTransactions = db
      .prepare(
        `SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name,
          r.id as receipt_id, r.file_url as receipt_url
         FROM transactions t
         LEFT JOIN users u ON t.created_by = u.id
         LEFT JOIN receipts r ON t.id = r.transaction_id
         WHERE t.team_id = ?
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT 10`
      )
      .all(teamId);

    // Get category breakdown
    const categoryBreakdown = db
      .prepare(
        `SELECT category, type,
          SUM(amount) as total_amount,
          COUNT(*) as count
         FROM transactions
         WHERE team_id = ? AND status = 'completed'
         GROUP BY category, type
         ORDER BY total_amount DESC`
      )
      .all(teamId) as { category: string; type: string; total_amount: number; count: number }[];

    // Get monthly trend (last 6 months)
    const monthlyTrend = db
      .prepare(
        `SELECT
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
         FROM transactions
         WHERE team_id = ? AND status = 'completed'
           AND date >= date('now', '-6 months')
         GROUP BY strftime('%Y-%m', date)
         ORDER BY month`
      )
      .all(teamId);

    const currentBalance = balanceResult.total_income - balanceResult.total_expenses;

    // Calculate percentages for category breakdown
    const expenseCategories = categoryBreakdown
      .filter((c) => c.type === 'expense')
      .map((c) => ({
        category: c.category,
        amount: c.total_amount,
        percentage:
          balanceResult.total_expenses > 0
            ? Math.round((c.total_amount / balanceResult.total_expenses) * 100)
            : 0,
        count: c.count,
      }));

    res.json({
      success: true,
      data: {
        currentBalance,
        totalIncome: balanceResult.total_income,
        totalExpenses: balanceResult.total_expenses,
        pendingTransactions: balanceResult.pending_count,
        recentTransactions,
        categoryBreakdown: expenseCategories,
        monthlyTrend,
      },
    });
  }
);

export default router;
