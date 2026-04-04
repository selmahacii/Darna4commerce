import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';
import reviewsRouter from './routes/reviews.js';
import cartRouter from './routes/cart.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3003', 10);

// ═══════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ═══════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'darna-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: '🌍 Darna Backend API — Algerian Artisan E-Commerce',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      users: '/api/users',
      ai: '/api/ai/recommendations',
      analytics: '/api/analytics/summary',
      reviews: '/api/reviews',
      cart: '/api/cart',
    },
  });
});

// ═══════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/cart', cartRouter);

// ═══════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════
app.use(notFoundHandler);
app.use(errorHandler);

// ═══════════════════════════════════════════════════════
// GLOBAL ERROR HANDLERS
// ═══════════════════════════════════════════════════════
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// ═══════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║   🌍 Darna Backend API — Node.js + Express             ║');
  console.log('║   Algerian Artisan E-Commerce                          ║');
  console.log('║                                                        ║');
  console.log(`║   Running on: http://localhost:${PORT}                   ║`);
  console.log('║   Environment:', process.env.NODE_ENV?.padEnd(36) + '║');
  console.log('║                                                        ║');
  console.log('║   Endpoints:                                           ║');
  console.log('║   ├── GET    /api/health                               ║');
  console.log('║   ├── GET    /api/products                             ║');
  console.log('║   ├── POST   /api/products                             ║');
  console.log('║   ├── GET    /api/products/:id                         ║');
  console.log('║   ├── PUT    /api/products/:id                         ║');
  console.log('║   ├── DELETE /api/products/:id                         ║');
  console.log('║   ├── GET    /api/categories                           ║');
  console.log('║   ├── GET    /api/orders                               ║');
  console.log('║   ├── POST   /api/orders                               ║');
  console.log('║   ├── GET    /api/users                                ║');
  console.log('║   ├── GET    /api/ai/recommendations                   ║');
  console.log('║   ├── GET    /api/analytics/summary                    ║');
  console.log('║   ├── GET    /api/reviews/product/:productId           ║');
  console.log('║   └── GET/POST /api/cart/:sessionId                    ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});

// Keep process alive
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

export default app;
