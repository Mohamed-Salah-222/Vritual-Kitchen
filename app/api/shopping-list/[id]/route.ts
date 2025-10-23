import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShoppingList from "@/models/ShoppingList";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    const item = await ShoppingList.findOneAndUpdate({ _id: id, userId }, body, { new: true });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await connectDB();

    const item = await ShoppingList.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from shopping list",
    });
  } catch (error) {
    console.error("Error deleting shopping list item:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
