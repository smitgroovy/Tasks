import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import categoryRoutes from './routes/category.routes';
import tagRoutes from './routes/tag.routes';
import workspaceRoutes from './routes/workspace.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Core middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (no auth required)
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/tasks', authenticate, taskRoutes);
app.use('/api/v1/categories', authenticate, categoryRoutes);
app.use('/api/v1/tags', authenticate, tagRoutes);
app.use('/api/v1/workspaces', authenticate, workspaceRoutes);
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);
app.use('/api/v1/admin', authenticate, adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
