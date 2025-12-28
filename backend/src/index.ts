import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import { initializeDatabase } from './db';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

async function startServer() {
  // Initialize database (async for sql.js)
  await initializeDatabase();

  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start server
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏆 TeamBudget API Server                                 ║
║                                                            ║
║   Server running on port ${PORT}                             ║
║   Environment: ${config.nodeEnv.padEnd(36)}║
║                                                            ║
║   Endpoints:                                               ║
║   - Health: http://localhost:${PORT}/api/health               ║
║   - Auth:   http://localhost:${PORT}/api/auth                 ║
║   - Teams:  http://localhost:${PORT}/api/teams                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
  });

  return app;
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
