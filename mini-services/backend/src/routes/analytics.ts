import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/summary — Dashboard analytics (admin only)
router.get('/summary', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const summary = {
      totalProducts: await db.product.count(),
      totalOrders: await db.order.count(),
      totalUsers: await db.user.count(),
      totalRevenue: (await db.order.aggregate({ _sum: { total: true } }))._sum.total || 0,
      lowStockProducts: await db.product.count({ where: { stock: { lte: 10 } } }),
      pendingOrders: await db.order.count({ where: { status: 'pending' } }),
      avgRating: (await db.product.aggregate({ _avg: { rating: true } }))._avg.rating || 0,
    };

    // Sales by category
    const categories = await db.category.findMany({
      include: {
        products: {
          include: { orderItems: true },
        },
      },
    });

    const salesByCategory = categories.map((cat) => ({
      name: cat.name,
      sales: cat.products.reduce(
        (sum, p) => sum + p.orderItems.reduce((s, i) => s + i.price * i.quantity, 0),
        0
      ),
    }));

    // Recent orders
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });

    // Top products
    const topProducts = await db.product.findMany({
      orderBy: { reviewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        rating: true,
        reviewCount: true,
        images: true,
      },
    });

    // Monthly sales trend (last 6 months) — computed from real order data
    const monthlySales = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      const end = new Date();
      end.setMonth(end.getMonth() - i + 1, 0);
      end.setHours(23, 59, 59, 999);
      const monthOrders = await db.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { total: true },
      });
      const monthLabel = start.toLocaleDateString('fr-FR', { month: 'short' });
      monthlySales.push({
        month: monthLabel,
        sales: monthOrders.reduce((s, o) => s + o.total, 0),
        orders: monthOrders.length,
      });
    }

    // Visitor analytics — computed from AnalyticsEvent table
    const totalEvents = await db.analyticsEvent.count();
    const uniqueSessions = (await db.analyticsEvent.groupBy({
      by: ['sessionId'],
    })).length;
    const visitorStats = {
      totalVisitors: uniqueSessions,
      uniqueVisitors: uniqueSessions,
      events: totalEvents,
    };

    res.json({
      summary,
      salesByCategory,
      recentOrders,
      topProducts,
      monthlySales,
      visitorStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/analytics/products — Product performance analytics (admin only)
router.get('/products', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        isNew: true,
        createdAt: true,
        category: { select: { name: true } },
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productStats = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      totalSold: p.orderItems.reduce((sum, i) => sum + i.quantity, 0),
      revenue: p.orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }));

    res.json(productStats);
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

// POST /api/analytics/events — Track analytics events (public)
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { event, properties = '{}', sessionId, userId } = req.body;
    const analyticsEvent = await db.analyticsEvent.create({
      data: {
        event,
        properties: typeof properties === 'string' ? properties : JSON.stringify(properties),
        sessionId,
        userId,
      },
    });
    res.status(201).json(analyticsEvent);
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

export default router;
