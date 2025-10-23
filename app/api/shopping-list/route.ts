import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ShoppingList from '@/models/ShoppingList';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const items = await ShoppingList.find({ userId }).sort({ isPurchased: 1, addedAt: -1 });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, quantity, unit, category } = body;

    await connectDB();

    // Check if item already exists
    const existing = await ShoppingList.findOne({
      userId,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isPurchased: false,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in shopping list' },
        { status: 400 }
      );
    }

    const item = await ShoppingList.create({
      userId,
      name,
      quantity,
      unit,
      category,
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}