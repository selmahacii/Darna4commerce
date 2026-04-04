import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = Router();

// ─── POST /api/auth/register ────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    // Validate required fields
    if (!email || !name || !password) {
      res.status(400).json({ error: 'Email, name, and password are required.' });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check for duplicate email
    const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: hashedPassword,
        role: 'customer',
      },
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
      },
    });

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        password: true,
        points: true,
        level: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account is deactivated.' });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
});

// ─── GET /api/auth/me ───────────────────────────────────
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
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
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ─── PUT /api/auth/change-password ──────────────────────
router.put('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    // Fetch user with password
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, password: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
