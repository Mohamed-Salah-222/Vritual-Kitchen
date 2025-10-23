import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const ingredients = await Ingredient.find({ userId }).sort({ addedAt: -1 });

    return NextResponse.json({
      success: true,
      ingredients,
    });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: "Invalid ingredients data" }, { status: 400 });
    }

    await connectDB();

    // Check for duplicates and merge
    const savedIngredients = await Promise.all(
      ingredients.map(async (ing) => {
        // Check if ingredient already exists (case-insensitive)
        const existing = await Ingredient.findOne({
          userId,
          name: { $regex: new RegExp(`^${ing.name}$`, "i") },
        });

        if (existing) {
          // Merge: Add quantities (convert to numbers, handle different units)
          const newQuantity = parseFloat(existing.quantity) + parseFloat(ing.quantity);
          existing.quantity = newQuantity.toString();
          existing.lastUpdated = new Date();
          return await existing.save();
        } else {
          // Create new ingredient
          const ingredient = new Ingredient({
            userId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            category: ing.category,
            isEssential: false, // Default to not essential
          });
          return await ingredient.save();
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: savedIngredients.length,
    });
  } catch (error) {
    console.error("Error saving ingredients:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
