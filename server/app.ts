import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import groupRoutes from './routes/groups';
import expenseRoutes from './routes/expenses';
import settlementRoutes from './routes/settlements';
import paymentRoutes from './routes/payments';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import friendRoutes from './routes/friends';
import chatRoutes from './routes/chat';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Vercel serverless URL normalization
app.use((req, res, next) => {
  if (req.url === '/api' || req.url === '/api/' || req.url.startsWith('/api/index')) {
    if (req.originalUrl && req.originalUrl !== req.url) {
      req.url = req.originalUrl;
    }
  }
  next();
});

const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SplitSmart AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini 1.5' : 'Deterministic Financial NLP',
    paymentProvider: process.env.PAYPAL_CLIENT_ID ? 'PayPal Sandbox Live' : 'PayPal Sandbox Verified Simulator',
    emailService: process.env.SMTP_HOST ? 'Active SMTP' : 'Development Console Mailbox',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/groups', groupRoutes);
apiRouter.use('/expenses', expenseRoutes);
apiRouter.use('/settlements', settlementRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/friends', friendRoutes);
apiRouter.use('/contacts', friendRoutes);
apiRouter.use('/chat', chatRoutes);

// Mount under both /api and / so all Vercel and local routing paths succeed
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Unhandled error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error occurred.',
  });
});

// Fallback 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl || req.url}` });
});

export default app;
export { app };
