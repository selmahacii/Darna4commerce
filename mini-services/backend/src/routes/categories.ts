import { Router, Request, Response } from 'express';
import db from '../config/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/categories — List all categories with product counts (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await db.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories — Create a new category (admin only)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, parentId } = req.body;
    const category = await db.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        image,
        parentId,
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/categories/:id — Get single category (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        products: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// PUT /api/categories/:id — Update category (admin only)
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await db.category.update({
      where: { id },
      data: req.body,
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id — Delete category (admin only)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
