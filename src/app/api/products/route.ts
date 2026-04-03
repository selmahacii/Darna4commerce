import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const featured = searchParams.get('featured') === 'true';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (category && category !== 'all') {
      where.category = { slug: category };
    }

    if (featured) {
      where.isFeatured = true;
    }

    where.price = { gte: minPrice, lte: maxPrice };

    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'price-asc': orderBy.price = 'asc'; break;
      case 'price-desc': orderBy.price = 'desc'; break;
      case 'popular': orderBy.reviewCount = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
