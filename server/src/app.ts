import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger/swaggerDoc';

import { authRouter } from './modules/auth/auth.controller';
import { membersRouter } from './modules/members/members.controller';
import { teachersRouter } from './modules/teachers/teachers.controller';
import { instrumentsRouter } from './modules/instruments/instruments.controller';
import { branchesRouter } from './modules/branches/branches.controller';
import { plansRouter } from './modules/plans/plans.controller';
import { membershipsRouter } from './modules/memberships/memberships.controller';
import { bookingsRouter } from './modules/bookings/bookings.controller';
import { paymentsRouter } from './modules/payments/payments.controller';
import { expensesRouter } from './modules/expenses/expenses.controller';
import { reportsRouter } from './modules/reports/reports.controller';

import { errorHandler } from './middleware/errorHandler.middleware';
import { ACADEMY_TIMEZONE } from './config/constants';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false // Allow Swagger UI inline scripts & styles
  })
);

// CORS configuration allowing local dev Vite frontend & API consumers
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body parsers with 10MB payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const istDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: ACADEMY_TIMEZONE,
    dateStyle: 'full',
    timeStyle: 'long'
  }).format(new Date());

  return res.json({
    success: true,
    status: 'ONLINE',
    service: 'APD MUSIC CLASS Backend API',
    version: '2.0.0',
    timezone: ACADEMY_TIMEZONE,
    academyLocalTime: istDate,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Swagger Interactive API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'APD MUSIC CLASS API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Domain Routes
app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/instruments', instrumentsRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/memberships', membershipsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/reports', reportsRouter);

// 404 Fallback for unmapped API endpoints
app.use('/api', (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized Exception Handling Middleware
app.use(errorHandler);

export default app;
