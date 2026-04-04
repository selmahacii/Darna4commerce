import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/users — List all users (admin only)
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
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

// GET /api/users/:id — Get single user with profile data (authenticated)
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only see their own profile (unless admin)
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You can only view your own profile.' });
      return;
    }

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

// POST /api/users — Create a new user (admin only)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, name, role = 'customer', avatar, password } = req.body;

    // Check for duplicate email
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const user = await db.user.create({
      data: { email, name, role, avatar, password: hashedPassword },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id — Update user profile (own profile or admin)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile (admin can update any)
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You can only update your own profile.' });
      return;
    }

    // Prevent non-admin from changing role
    if (req.user!.role !== 'admin' && req.body.role) {
      delete req.body.role;
    }

    // Destructure and handle password hashing, strip sensitive fields
    const { id: _id, createdAt: _ca, _count: _co, badges: _ba, pointHistory: _ph, password, ...updateData } = req.body;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id — Delete user (admin only)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/:id/points — Add points to user (admin only)
router.post('/:id/points', requireAdmin, async (req: Request, res: Response) => {
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
