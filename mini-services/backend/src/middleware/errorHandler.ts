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
      'GET    /api/products',
      'POST   /api/products',
      'GET    /api/products/:id',
      'PUT    /api/products/:id',
      'DELETE /api/products/:id',
      'GET    /api/categories',
      'POST   /api/categories',
      'GET    /api/orders',
      'POST   /api/orders',
      'GET    /api/users',
      'POST   /api/users',
      'GET    /api/ai/recommendations',
      'GET    /api/analytics/summary',
      'GET    /api/reviews/product/:productId',
      'POST   /api/reviews',
      'GET    /api/cart/:sessionId',
      'POST   /api/cart',
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
