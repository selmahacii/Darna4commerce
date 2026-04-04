import { Router, Request, Response } from 'express';
import db from '../config/database.js';

const router = Router();

// GET /api/products — List products with filtering, sorting, pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = '0',
      maxPrice = '100000',
      sortBy = 'newest',
      page = '1',
      limit = '12',
      featured,
      isNew,
    } = req.query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { tags: { contains: search as string } },
      ];
    }

    if (category && category !== 'all') {
      where.category = { slug: category as string };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (isNew === 'true') {
      where.isNew = true;
    }

    where.price = { gte: parseFloat(minPrice as string), lte: parseFloat(maxPrice as string) };

    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'price-asc': orderBy.price = 'asc'; break;
      case 'price-desc': orderBy.price = 'desc'; break;
      case 'popular': orderBy.reviewCount = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { category: true },
      }),
      db.product.count({ where }),
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products — Create a new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const product = await db.product.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        description: body.description,
        shortDesc: body.shortDesc,
        price: body.price,
        comparePrice: body.comparePrice,
        categoryId: body.categoryId,
        images: body.images || '[]',
        colors: body.colors || '[]',
        materials: body.materials || '[]',
        dimensions: body.dimensions,
        weight: body.weight,
        stock: body.stock || 0,
        isFeatured: body.isFeatured || false,
        isNew: body.isNew || false,
        tags: body.tags || '[]',
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products/:id — Get single product with reviews and related products
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const related = await db.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 4,
      orderBy: { rating: 'desc' },
    });

    res.json({ product, related });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// PUT /api/products/:id — Update a product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await db.product.update({
      where: { id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id — Delete a product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
