import { NextRequest, NextResponse } from "next/server";
import { generateRecipes } from "@/lib/generateRecipe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, filters } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }

    const recipes = await generateRecipes(ingredients, filters);

    return NextResponse.json({
      success: true,
      recipes,
    });
  } catch (error) {
    console.error("Error generating recipes:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
