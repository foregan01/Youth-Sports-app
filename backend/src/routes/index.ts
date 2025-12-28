import { Router } from 'express';
import authRoutes from './auth';
import teamsRoutes from './teams';
import transactionsRoutes from './transactions';
import receiptsRoutes from './receipts';
import notificationsRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/teams', teamsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/receipts', receiptsRoutes);
router.use('/notifications', notificationsRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
