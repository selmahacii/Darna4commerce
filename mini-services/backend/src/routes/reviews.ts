import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/reviews/product/:productId — Get reviews for a product (public)
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews — Create a new review (authenticated)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Use authenticated user's ID
    const userId = req.user!.id;

    const review = await db.review.create({
      data: { productId, userId, rating, title, comment },
    });

    // Update product rating and review count
    const allReviews = await db.review.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// DELETE /api/reviews/:id — Delete a review (own review or admin)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await db.review.findUnique({ where: { id } });

    if (!review) {
      res.status(404).json({ error: 'Review not found.' });
      return;
    }

    // Users can only delete their own reviews (unless admin)
    if (req.user!.id !== review.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You can only delete your own reviews.' });
      return;
    }

    await db.review.delete({ where: { id } });
    // Recalculate product rating
    const allReviews = await db.review.findMany({ where: { productId: review.productId } });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await db.product.update({
        where: { id: review.productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      });
    } else {
      await db.product.update({
        where: { id: review.productId },
        data: { rating: 0, reviewCount: 0 },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
