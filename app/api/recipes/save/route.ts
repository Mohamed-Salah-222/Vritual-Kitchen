import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, prepTime, cookTime, servings, calories, ingredients, instructions, tags } = body;

    await connectDB();

    const recipe = new Recipe({
      userId,
      name,
      description,
      prepTime,
      cookTime,
      servings,
      calories,
      ingredients,
      instructions,
      tags,
      isFavorite: true,
    });

    await recipe.save();

    return NextResponse.json({
      success: true,
      recipeId: recipe._id,
    });
  } catch (error) {
    console.error("Error saving recipe:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
