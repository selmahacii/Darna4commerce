import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { requireAdmin, authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/coupons — List all coupons (admin only)
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons.' });
  }
});

// POST /api/coupons — Create a coupon (admin only)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, discountType, discountValue, description, minOrderTotal, endDate, usageLimit } = req.body;
    
    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Un coupon avec ce code existe déjà.' });
    }

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        description,
        minOrderTotal: parseFloat(minOrderTotal || 0),
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

// GET /api/coupons/validate/:code — Validate a coupon code
router.get('/validate/:code', authenticate, async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { total } = req.query; // Total amount to check minOrderTotal

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Coupon invalide ou expiré.' });
    }

    if (coupon.endDate && new Date() > coupon.endDate) {
      return res.status(400).json({ error: 'Coupon expiré.' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Nombre maximal d\'utilisations atteint.' });
    }

    if (total && parseFloat(total as string) < coupon.minOrderTotal) {
      return res.status(400).json({ error: `Le montant minimum pour ce coupon est de ${coupon.minOrderTotal} DA.` });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon.' });
  }
});

// DELETE /api/coupons/:id — Delete a coupon
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: 'Coupon supprimé.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

export default router;
