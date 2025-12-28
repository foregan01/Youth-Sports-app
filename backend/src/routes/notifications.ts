import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === 'true';
  const teamId = req.query.teamId as string;

  let whereClause = 'WHERE user_id = ?';
  const params: (string | number)[] = [req.user!.id];

  if (unreadOnly) {
    whereClause += ' AND is_read = 0';
  }

  if (teamId) {
    whereClause += ' AND team_id = ?';
    params.push(teamId);
  }

  // Get total count
  const countResult = db
    .prepare(`SELECT COUNT(*) as count FROM notifications ${whereClause}`)
    .get(...params) as { count: number };

  // Get unread count
  const unreadResult = db
    .prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
    .get(req.user!.id) as { count: number };

  // Get notifications
  const notifications = db
    .prepare(
      `SELECT n.*, t.name as team_name
       FROM notifications n
       LEFT JOIN teams t ON n.team_id = t.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    success: true,
    data: notifications,
    unreadCount: unreadResult.count,
    pagination: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
  });
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const notification = db
      .prepare('SELECT user_id FROM notifications WHERE id = ?')
      .get(req.params.id) as { user_id: string } | undefined;

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== req.user!.id) {
      throw new AppError('Not authorized', 403);
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  const teamId = req.query.teamId as string;

  if (teamId) {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND team_id = ?').run(
      req.user!.id,
      teamId
    );
  } else {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
  }

  res.json({ success: true, message: 'All notifications marked as read' });
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const notification = db
      .prepare('SELECT user_id FROM notifications WHERE id = ?')
      .get(req.params.id) as { user_id: string } | undefined;

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== req.user!.id) {
      throw new AppError('Not authorized', 403);
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/send - Send notification (internal use)
router.post('/send', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const { teamId, userIds, type, title, message, data } = req.body;

    if (!teamId || !type || !title || !message) {
      throw new AppError('Missing required fields', 400);
    }

    // Check if user is treasurer
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(teamId, req.user!.id) as { role: string } | undefined;

    if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
      throw new AppError('Only treasurers can send notifications', 403);
    }

    // Get target users
    let targetUsers: { user_id: string }[];
    if (userIds && Array.isArray(userIds)) {
      targetUsers = userIds.map((id: string) => ({ user_id: id }));
    } else {
      // Send to all team members
      targetUsers = db
        .prepare('SELECT user_id FROM team_members WHERE team_id = ? AND is_active = 1')
        .all(teamId) as { user_id: string }[];
    }

    const insertStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, team_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let sentCount = 0;
    for (const user of targetUsers) {
      insertStmt.run(
        uuidv4(),
        user.user_id,
        teamId,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      );
      sentCount++;
    }

    res.json({ success: true, message: `Sent ${sentCount} notifications` });
  } catch (error) {
    next(error);
  }
});

export default router;
