import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/orders — List all orders (last 50)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const orders = await db.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/user/:userId — Get orders for a specific user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id — Get single order with items
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /api/orders — Create a new order with items
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const order = await db.order.create({
      data: {
        userId: body.userId,
        total: body.total,
        subtotal: body.subtotal,
        tax: body.tax || 0,
        shipping: body.shipping || 0,
        address: body.address,
        city: body.city,
        country: body.country,
        zipCode: body.zipCode,
        paymentMethod: body.paymentMethod || 'credit_card',
        note: body.note,
        items: {
          create: body.items.map((item: {
            productId: string;
            quantity: number;
            price: number;
            color?: string;
            material?: string;
            engraving?: string;
          }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            material: item.material,
            engraving: item.engraving,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Update product stock
    for (const item of body.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PATCH /api/orders/:id/status — Update order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await db.order.update({
      where: { id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
