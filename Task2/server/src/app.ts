import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import taskRoutes from './routes/task.routes';
import categoryRoutes from './routes/category.routes';
import tagRoutes from './routes/tag.routes';
import workspaceRoutes from './routes/workspace.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Core middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
