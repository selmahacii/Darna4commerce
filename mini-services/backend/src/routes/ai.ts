import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/ai/recommendations — AI-driven product recommendations (admin only)
router.get('/recommendations', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }

    // Get product's category for category-based recommendations
    const product = await db.product.findUnique({
      where: { id: productId as string },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // AI-driven recommendation logic:
    // 1. Same category, high-rated products
    // 2. Similar price range, popular items
    // 3. Featured trending items
    const sameCategory = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId as string },
        rating: { gte: 4.5 },
      },
      take: 3,
      orderBy: { rating: 'desc' },
    });

    const priceRange = product.price * 0.5;
    const similarPrice = await db.product.findMany({
      where: {
        id: {
          not: productId as string,
          notIn: sameCategory.map((p) => p.id),
        },
        price: {
          gte: Math.max(0, product.price - priceRange),
          lte: product.price + priceRange,
        },
      },
      take: 2,
      orderBy: { reviewCount: 'desc' },
    });

    const trending = await db.product.findMany({
      where: {
        id: {
          not: productId as string,
          notIn: [...sameCategory.map((p) => p.id), ...similarPrice.map((p) => p.id)],
        },
        isFeatured: true,
      },
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    const recommendations = [...sameCategory, ...similarPrice, ...trending];

    res.json({
      recommendations,
      reason: {
        sameCategory: sameCategory.length,
        similarPrice: similarPrice.length,
        trending: trending.length,
      },
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// GET /api/ai/search — Smart product search (admin only)
router.get('/search', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { tags: { contains: q as string } },
          { shortDesc: { contains: q as string } },
        ],
      },
      take: 10,
      orderBy: { rating: 'desc' },
      include: { category: true },
    });

    res.json({ query: q, results: products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

export default router;
