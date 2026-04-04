import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/cart/:sessionId — Get cart for a session (public / optional auth)
router.get('/:sessionId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // If authenticated, try to get cart by userId first
    let cartItems;
    if (req.user) {
      cartItems = await db.cartItem.findMany({
        where: {
          OR: [
            { userId: req.user.id },
            { sessionId },
          ],
        },
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      });
    } else {
      cartItems = await db.cartItem.findMany({
        where: { sessionId },
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart — Add item to cart (authenticated)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { sessionId, productId, quantity = 1, color, material, engraving } = req.body;

    // Use authenticated user's ID
    const userId = req.user!.id;

    // Check if item already in cart for this user
    const existing = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    let cartItem;
    if (existing) {
      cartItem = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      cartItem = await db.cartItem.create({
        data: { userId, sessionId, productId, quantity, color, material, engraving },
      });
    }

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:id — Update cart item quantity (authenticated)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, color, material, engraving } = req.body;

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({ where: { id } });
    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found.' });
      return;
    }
    if (cartItem.userId && cartItem.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only modify your own cart items.' });
      return;
    }

    const updated = await db.cartItem.update({
      where: { id },
      data: { quantity, color, material, engraving },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id — Remove item from cart (authenticated)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify cart item belongs to user
    const cartItem = await db.cartItem.findUnique({ where: { id } });
    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found.' });
      return;
    }
    if (cartItem.userId && cartItem.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only modify your own cart items.' });
      return;
    }

    await db.cartItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart/session/:sessionId — Clear entire cart for a session (authenticated)
router.delete('/session/:sessionId', authenticate, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Delete by user ID or session ID
    await db.cartItem.deleteMany({
      where: {
        OR: [
          { userId: req.user!.id },
          ...(sessionId ? [{ sessionId }] : []),
        ],
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
