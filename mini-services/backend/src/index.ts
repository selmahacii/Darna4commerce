import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandler.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import ordersRouter from './routes/orders.js';
import usersRouter from './routes/users.js';
import smartRouter from './routes/smart.js';
import analyticsRouter from './routes/analytics.js';
import reviewsRouter from './routes/reviews.js';
import cartRouter from './routes/cart.js';
import authRouter from './routes/auth.js';
import couponsRouter from './routes/coupons.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3003', 10);

// ═══════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════
app.use(cors({
  origin: ['http://localhost:3010', 'http://127.0.0.1:3010', 'http://172.25.224.1:3010'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
// app.options('*', cors()); // Enable pre-flight for all routes

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
  contentSecurityPolicy: false,
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
    version: '1.1.0',
    auth: 'jwt',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: '🌍 Darna Backend API — Algerian Artisan E-Commerce',
    version: '1.1.0',
    auth: 'JWT Bearer Token',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (auth)',
        changePassword: 'PUT /api/auth/change-password (auth)',
      },
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      users: '/api/users',
      smart: '/api/smart/recommendations',
      analytics: '/api/analytics/summary (admin)',
      reviews: '/api/reviews',
      cart: '/api/cart',
    },
  });
});

// ═══════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/smart', smartRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);

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
  console.log('║   🔐 JWT Authentication Enabled                        ║');
  console.log('║                                                        ║');
  console.log(`║   Running on: http://0.0.0.0:${PORT}                   ║`);
  console.log('║   Environment:', process.env.NODE_ENV?.padEnd(36) + '║');
  console.log('║                                                        ║');
  console.log('║   Public Endpoints:                                    ║');
  console.log('║   ├── POST   /api/auth/register                        ║');
  console.log('║   ├── POST   /api/auth/login                           ║');
  console.log('║   ├── GET    /api/products                             ║');
  console.log('║   ├── GET    /api/products/:id                         ║');
  console.log('║   ├── GET    /api/categories                           ║');
  console.log('║   ├── GET    /api/reviews/product/:productId           ║');
  console.log('║   └── GET    /api/health                               ║');
  console.log('║                                                        ║');
  console.log('║   Authenticated Endpoints:                              ║');
  console.log('║   ├── GET    /api/auth/me                              ║');
  console.log('║   ├── PUT    /api/auth/change-password                 ║');
  console.log('║   ├── POST   /api/orders                               ║');
  console.log('║   ├── POST   /api/reviews                              ║');
  console.log('║   └── GET/POST/PUT/DELETE /api/cart                    ║');
  console.log('║                                                        ║');
  console.log('║   Admin-Only Endpoints:                                 ║');
  console.log('║   ├── POST/PUT/DELETE /api/products                    ║');
  console.log('║   ├── POST/PUT/DELETE /api/categories                  ║');
  console.log('║   ├── PATCH   /api/orders/:id/status                   ║');
  console.log('║   ├── GET     /api/users                               ║');
  console.log('║   └── GET     /api/analytics/*                         ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});

// Keep process alive
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

export default app;
