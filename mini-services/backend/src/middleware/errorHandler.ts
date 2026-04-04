import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err.message);

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: 'Route not found',
    availableRoutes: [
      'GET    /api/health',
      'GET    /api',
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/auth/me',
      'PUT    /api/auth/change-password',
      'GET    /api/products',
      'POST   /api/products (admin)',
      'GET    /api/products/:id',
      'PUT    /api/products/:id (admin)',
      'DELETE /api/products/:id (admin)',
      'GET    /api/categories',
      'POST   /api/categories (admin)',
      'GET    /api/categories/:id',
      'PUT    /api/categories/:id (admin)',
      'DELETE /api/categories/:id (admin)',
      'GET    /api/orders (admin)',
      'GET    /api/orders/user/:userId (auth)',
      'GET    /api/orders/:id (auth)',
      'POST   /api/orders (auth)',
      'PATCH  /api/orders/:id/status (admin)',
      'GET    /api/users (admin)',
      'GET    /api/users/:id (auth)',
      'POST   /api/users (admin)',
      'PUT    /api/users/:id (auth)',
      'DELETE /api/users/:id (admin)',
      'POST   /api/users/:id/points (admin)',
      'GET    /api/ai/recommendations (admin)',
      'GET    /api/ai/search (admin)',
      'GET    /api/analytics/summary (admin)',
      'GET    /api/analytics/products (admin)',
      'POST   /api/analytics/events (public)',
      'GET    /api/reviews/product/:productId',
      'POST   /api/reviews (auth)',
      'DELETE /api/reviews/:id (auth)',
      'GET    /api/cart/:sessionId',
      'POST   /api/cart (auth)',
      'PUT    /api/cart/:id (auth)',
      'DELETE /api/cart/:id (auth)',
      'DELETE /api/cart/session/:sessionId (auth)',
    ],
  });
}

// Simple request logger without response event listeners
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Use on('close') instead of on('finish') to avoid issues
  res.on('close', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[33m' : '\x1b[32m';
    console.log(
      `${color}${status}\x1b[0m ${req.method} ${req.originalUrl} - ${duration}ms [${timestamp}]`
    );
  });

  next();
}
