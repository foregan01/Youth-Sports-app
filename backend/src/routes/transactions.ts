import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import db from '../db';
import { authenticate, requireTeamAccess, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const createTransactionSchema = z.object({
  teamId: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  notes: z.string().optional(),
});

const updateTransactionSchema = createTransactionSchema.partial().omit({ teamId: true });

// GET /api/transactions - Get transactions for a team
router.get('/', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const teamId = req.query.teamId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const type = req.query.type as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!teamId) {
      throw new AppError('Team ID is required', 400);
    }

    // Check team access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(teamId, req.user!.id);

    if (!membership) {
      throw new AppError('Not a member of this team', 403);
    }

    // Build query
    let whereClause = 'WHERE t.team_id = ?';
    const params: (string | number)[] = [teamId];

    if (type) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }
    if (category) {
      whereClause += ' AND t.category = ?';
      params.push(category);
    }
    if (startDate) {
      whereClause += ' AND t.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND t.date <= ?';
      params.push(endDate);
    }

    // Get total count
    const countResult = db
      .prepare(`SELECT COUNT(*) as count FROM transactions t ${whereClause}`)
      .get(...params) as { count: number };

    // Get transactions
    const transactions = db
      .prepare(
        `SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name,
          r.id as receipt_id, r.file_url as receipt_url, r.thumbnail_url
         FROM transactions t
         LEFT JOIN users u ON t.created_by = u.id
         LEFT JOIN receipts r ON t.id = r.transaction_id
         ${whereClause}
         ORDER BY t.date DESC, t.created_at DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total: countResult.count,
        totalPages: Math.ceil(countResult.count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions - Create a new transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);

    // Check team access (treasurer or admin only for creating transactions)
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(data.teamId, req.user!.id) as { role: string } | undefined;

    if (!membership) {
      throw new AppError('Not a member of this team', 403);
    }

    if (!['treasurer', 'admin'].includes(membership.role)) {
      throw new AppError('Only treasurers can add transactions', 403);
    }

    // Create transaction (amount stored in cents)
    const transactionId = uuidv4();
    const amountInCents = Math.round(data.amount * 100);

    db.prepare(`
      INSERT INTO transactions (id, team_id, type, amount, category, description, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      transactionId,
      data.teamId,
      data.type,
      amountInCents,
      data.category,
      data.description,
      data.date,
      data.notes || null,
      req.user!.id
    );

    // Get new balance
    const balance = db
      .prepare(
        `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
         FROM transactions WHERE team_id = ? AND status = 'completed'`
      )
      .get(data.teamId) as { balance: number };

    // Create notifications for parents if expense > $100
    if (data.type === 'expense' && data.amount >= 100) {
      const parents = db
        .prepare(
          `SELECT user_id FROM team_members
           WHERE team_id = ? AND role = 'parent' AND is_active = 1`
        )
        .all(data.teamId) as { user_id: string }[];

      const notificationStmt = db.prepare(`
        INSERT INTO notifications (id, user_id, team_id, type, title, message, data)
        VALUES (?, ?, ?, 'large_expense', ?, ?, ?)
      `);

      for (const parent of parents) {
        notificationStmt.run(
          uuidv4(),
          parent.user_id,
          data.teamId,
          `New expense: $${data.amount.toFixed(2)}`,
          `${data.description} - ${data.category}`,
          JSON.stringify({ transactionId, amount: amountInCents })
        );
      }
    }

    const transaction = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(transactionId);

    res.status(201).json({
      success: true,
      data: {
        transaction,
        newBalance: balance.balance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/:id - Get single transaction
router.get('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const transaction = db
      .prepare(
        `SELECT t.*, u.first_name || ' ' || u.last_name as created_by_name
         FROM transactions t
         LEFT JOIN users u ON t.created_by = u.id
         WHERE t.id = ?`
      )
      .get(req.params.id) as { team_id: string } | undefined;

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Check team access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(transaction.team_id, req.user!.id);

    if (!membership) {
      throw new AppError('Not a member of this team', 403);
    }

    // Get receipt if exists
    const receipt = db
      .prepare('SELECT * FROM receipts WHERE transaction_id = ?')
      .get(req.params.id);

    res.json({
      success: true,
      data: { ...transaction, receipt },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const data = updateTransactionSchema.parse(req.body);

    // Get current transaction
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(req.params.id) as { team_id: string; status: string } | undefined;

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'voided') {
      throw new AppError('Cannot update voided transaction', 400);
    }

    // Check treasurer access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(transaction.team_id, req.user!.id) as { role: string } | undefined;

    if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
      throw new AppError('Only treasurers can update transactions', 403);
    }

    // Build update query
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.type) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(Math.round(data.amount * 100));
    }
    if (data.category) {
      updates.push('category = ?');
      values.push(data.category);
    }
    if (data.description) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.date) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(req.params.id);

      db.prepare(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// POST /api/transactions/:id/void - Void a transaction
router.post('/:id/void', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    // Get transaction
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(req.params.id) as { team_id: string; status: string } | undefined;

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status === 'voided') {
      throw new AppError('Transaction already voided', 400);
    }

    // Check treasurer access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(transaction.team_id, req.user!.id) as { role: string } | undefined;

    if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
      throw new AppError('Only treasurers can void transactions', 403);
    }

    // Void the transaction
    db.prepare(
      "UPDATE transactions SET status = 'voided', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(req.params.id);

    res.json({ success: true, message: 'Transaction voided successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/transactions/categories/summary - Get category summary
router.get('/categories/summary', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      throw new AppError('Team ID is required', 400);
    }

    // Check team access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(teamId, req.user!.id);

    if (!membership) {
      throw new AppError('Not a member of this team', 403);
    }

    const summary = db
      .prepare(
        `SELECT category, type,
          SUM(amount) as total_amount,
          COUNT(*) as transaction_count,
          AVG(amount) as avg_amount
         FROM transactions
         WHERE team_id = ? AND status = 'completed'
         GROUP BY category, type
         ORDER BY total_amount DESC`
      )
      .all(teamId);

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

export default router;
