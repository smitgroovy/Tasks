import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';
import { env } from './config/env';

const PORT = parseInt(env.PORT) || 5000;

async function start() {
  await connectDB();

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
