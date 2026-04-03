import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Get product's category for category-based recommendations
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // AI-driven recommendation logic:
    // 1. Same category, high-rated products
    // 2. Similar price range
    // 3. Popular items (high review count)
    const sameCategory = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        rating: { gte: 4.5 },
      },
      take: 3,
      orderBy: { rating: 'desc' },
    });

    const priceRange = product.price * 0.5;
    const similarPrice = await db.product.findMany({
      where: {
        id: { not: productId, notIn: sameCategory.map((p) => p.id) },
        price: { gte: product.price - priceRange, lte: product.price + priceRange },
      },
      take: 2,
      orderBy: { reviewCount: 'desc' },
    });

    const trending = await db.product.findMany({
      where: {
        id: { not: productId, notIn: [...sameCategory.map((p) => p.id), ...similarPrice.map((p) => p.id)] },
        isFeatured: true,
      },
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    const recommendations = [...sameCategory, ...similarPrice, ...trending];

    return NextResponse.json({
      recommendations,
      reason: {
        sameCategory: sameCategory.length,
        similarPrice: similarPrice.length,
        trending: trending.length,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
