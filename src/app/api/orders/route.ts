import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
          create: body.items.map((item: { productId: string; quantity: number; price: number; color?: string; material?: string; engraving?: string }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            material: item.material,
            engraving: item.engraving,
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
