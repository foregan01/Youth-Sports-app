import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Ensure upload directory exists
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

// POST /api/receipts - Upload a receipt
router.post(
  '/',
  authenticate,
  upload.single('receipt'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
      }

      if (!req.file) {
        throw new AppError('Receipt file is required', 400);
      }

      // Get transaction and verify access
      const transaction = db
        .prepare('SELECT team_id FROM transactions WHERE id = ?')
        .get(transactionId) as { team_id: string } | undefined;

      if (!transaction) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        throw new AppError('Transaction not found', 404);
      }

      // Check treasurer access
      const membership = db
        .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
        .get(transaction.team_id, req.user!.id) as { role: string } | undefined;

      if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Only treasurers can upload receipts', 403);
      }

      // Check if receipt already exists
      const existingReceipt = db
        .prepare('SELECT id FROM receipts WHERE transaction_id = ?')
        .get(transactionId);

      if (existingReceipt) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Receipt already exists for this transaction', 400);
      }

      // Create receipt record
      const receiptId = uuidv4();
      const fileUrl = `/uploads/${req.file.filename}`;

      db.prepare(`
        INSERT INTO receipts (id, transaction_id, file_url, file_name, file_size, mime_type, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        receiptId,
        transactionId,
        fileUrl,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        req.user!.id
      );

      const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(receiptId);

      res.status(201).json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/receipts/:id - Get receipt details
router.get('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const receipt = db
      .prepare(
        `SELECT r.*, t.team_id
         FROM receipts r
         JOIN transactions t ON r.transaction_id = t.id
         WHERE r.id = ?`
      )
      .get(req.params.id) as { team_id: string } | undefined;

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    // Check team access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(receipt.team_id, req.user!.id);

    if (!membership) {
      throw new AppError('Not a member of this team', 403);
    }

    res.json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/receipts/:id - Delete receipt
router.delete('/:id', authenticate, (req: AuthRequest, res: Response, next) => {
  try {
    const receipt = db
      .prepare(
        `SELECT r.*, t.team_id
         FROM receipts r
         JOIN transactions t ON r.transaction_id = t.id
         WHERE r.id = ?`
      )
      .get(req.params.id) as { team_id: string; file_url: string } | undefined;

    if (!receipt) {
      throw new AppError('Receipt not found', 404);
    }

    // Check treasurer access
    const membership = db
      .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
      .get(receipt.team_id, req.user!.id) as { role: string } | undefined;

    if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
      throw new AppError('Only treasurers can delete receipts', 403);
    }

    // Delete file
    const filePath = path.join(config.upload.dir, path.basename(receipt.file_url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record
    db.prepare('DELETE FROM receipts WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/receipts/:id - Replace receipt
router.put(
  '/:id',
  authenticate,
  upload.single('receipt'),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.file) {
        throw new AppError('Receipt file is required', 400);
      }

      const existingReceipt = db
        .prepare(
          `SELECT r.*, t.team_id
           FROM receipts r
           JOIN transactions t ON r.transaction_id = t.id
           WHERE r.id = ?`
        )
        .get(req.params.id) as { team_id: string; file_url: string } | undefined;

      if (!existingReceipt) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Receipt not found', 404);
      }

      // Check treasurer access
      const membership = db
        .prepare('SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND is_active = 1')
        .get(existingReceipt.team_id, req.user!.id) as { role: string } | undefined;

      if (!membership || !['treasurer', 'admin'].includes(membership.role)) {
        fs.unlinkSync(req.file.path);
        throw new AppError('Only treasurers can replace receipts', 403);
      }

      // Delete old file
      const oldFilePath = path.join(config.upload.dir, path.basename(existingReceipt.file_url));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update record
      const newFileUrl = `/uploads/${req.file.filename}`;
      db.prepare(`
        UPDATE receipts
        SET file_url = ?, file_name = ?, file_size = ?, mime_type = ?, uploaded_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newFileUrl, req.file.originalname, req.file.size, req.file.mimetype, req.params.id);

      const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id);

      res.json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
