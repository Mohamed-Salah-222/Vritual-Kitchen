import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No ingredient IDs provided" }, { status: 400 });
    }

    await connectDB();

    const result = await Ingredient.deleteMany({
      _id: { $in: ids },
      userId, // Ensure user can only delete their own ingredients
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error batch deleting ingredients:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
