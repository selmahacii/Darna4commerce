import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/users — List all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        points: true,
        level: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id — Get single user with profile data
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.user.findUnique({
      where: { id },
      include: {
        badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
        pointHistory: { orderBy: { createdAt: 'desc' }, take: 20 },
        _count: { select: { orders: true, reviews: true } },
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users — Create a new user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, role = 'customer', avatar } = req.body;
    const user = await db.user.create({
      data: { email, name, role, avatar },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id — Update user profile
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await db.user.update({
      where: { id },
      data: req.body,
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/users/:id/points — Add points to user
router.post('/:id/points', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    const user = await db.user.update({
      where: { id },
      data: {
        points: { increment: points },
      },
    });

    await db.pointHistory.create({
      data: { userId: id, points, reason },
    });

    res.json(user);
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

export default router;
