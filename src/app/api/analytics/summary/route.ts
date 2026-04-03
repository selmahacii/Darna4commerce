import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const summary = {
      totalProducts: await db.product.count(),
      totalOrders: await db.order.count(),
      totalUsers: await db.user.count(),
      totalRevenue: (await db.order.aggregate({ _sum: { total: true } }))._sum.total || 0,
      lowStockProducts: await db.product.count({ where: { stock: { lte: 10 } } }),
      pendingOrders: await db.order.count({ where: { status: 'pending' } }),
      avgRating: (
        await db.product.aggregate({ _avg: { rating: true } })
      )._avg.rating || 0,
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
      select: { id: true, name: true, price: true, stock: true, rating: true, reviewCount: true, images: true },
    });

    // Monthly sales trend (last 6 months simulated)
    const monthlySales = [
      { month: 'Jan', sales: 24500, orders: 156 },
      { month: 'Feb', sales: 31200, orders: 189 },
      { month: 'Mar', sales: 28900, orders: 178 },
      { month: 'Apr', sales: 35600, orders: 210 },
      { month: 'May', sales: 42300, orders: 245 },
      { month: 'Jun', sales: 38700, orders: 223 },
    ];

    // Visitor analytics (simulated)
    const visitorStats = {
      totalVisitors: 45230,
      uniqueVisitors: 28450,
      bounceRate: 32.5,
      avgSessionDuration: '4m 32s',
      pageViews: 128900,
      topPages: [
        { path: '/catalog', views: 18500 },
        { path: '/product/aura-pro', views: 12300 },
        { path: '/product/ergonix-pro', views: 9800 },
        { path: '/product/chronos', views: 8700 },
        { path: '/product/echo-sphere', views: 7600 },
      ],
    };

    return NextResponse.json({
      summary,
      salesByCategory,
      recentOrders,
      topProducts,
      monthlySales,
      visitorStats,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
