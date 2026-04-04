import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/cart/:sessionId — Get cart for a session
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart — Add item to cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId, productId, quantity = 1, color, material, engraving } = req.body;

    // Check if item already in cart
    const existing = await db.cartItem.findFirst({
      where: {
        OR: [
          { userId: userId || undefined, productId },
          ...(sessionId ? [{ sessionId, productId }] : []),
        ],
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

// PUT /api/cart/:id — Update cart item quantity
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, color, material, engraving } = req.body;
    const cartItem = await db.cartItem.update({
      where: { id },
      data: { quantity, color, material, engraving },
    });
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id — Remove item from cart
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.cartItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart/session/:sessionId — Clear entire cart for a session
router.delete('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    await db.cartItem.deleteMany({ where: { sessionId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
