import app from './app';
import dotenv from 'dotenv';
import { ACADEMY_TIMEZONE } from './config/constants';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎶 APD MUSIC CLASS — Enterprise Backend Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`📖 Swagger API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check:    http://localhost:${PORT}/api/health`);
  console.log(`🕒 Academy Timezone: ${ACADEMY_TIMEZONE}`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
