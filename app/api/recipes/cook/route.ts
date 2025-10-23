import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import Ingredient from "@/models/Ingredient";
import { auth } from "@clerk/nextjs/server";

interface RecipeIngredient {
  name: string;
  amount: string;
  fromKitchen: boolean;
}

// Parse amount from recipe ingredient (e.g., "200g" -> 200, "2 cups" -> 2)
function parseAmount(amountString: string): number {
  const match = amountString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 1;
}

// Get unit from amount string (e.g., "200g" -> "grams", "2 pieces" -> "pieces")
function extractUnit(amountString: string): string {
  const lowerAmount = amountString.toLowerCase();

  if (lowerAmount.includes("gram") || lowerAmount.includes("g")) return "grams";
  if (lowerAmount.includes("kg") || lowerAmount.includes("kilo")) return "kg";
  if (lowerAmount.includes("ml") || lowerAmount.includes("milliliter")) return "ml";
  if (lowerAmount.includes("liter") || lowerAmount.includes("l")) return "liters";
  if (lowerAmount.includes("oz") || lowerAmount.includes("ounce")) return "oz";
  if (lowerAmount.includes("lb") || lowerAmount.includes("pound")) return "lbs";
  if (lowerAmount.includes("cup")) return "cups";
  if (lowerAmount.includes("tbsp") || lowerAmount.includes("tablespoon")) return "tbsp";
  if (lowerAmount.includes("tsp") || lowerAmount.includes("teaspoon")) return "tsp";
  if (lowerAmount.includes("piece") || lowerAmount.includes("pc")) return "pieces";

  return "pieces"; // default
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipe } = body;

    await connectDB();

    // Create a NEW recipe in history
    const cookedRecipe = new Recipe({
      userId,
      name: recipe.name,
      description: recipe.description,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      calories: recipe.calories,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tags: recipe.tags,
      cookedAt: new Date(),
      isFavorite: false,
    });
    await cookedRecipe.save();

    // Smart ingredient quantity updates
    const updates = (recipe.ingredients as RecipeIngredient[])
      .filter((ing) => ing.fromKitchen)
      .map(async (recipeIng) => {
        const ingredient = await Ingredient.findOne({
          userId,
          name: { $regex: new RegExp(`^${recipeIng.name}$`, "i") },
        });

        if (ingredient) {
          const currentQty = parseFloat(ingredient.quantity);
          const recipeAmount = parseAmount(recipeIng.amount);
          const recipeUnit = extractUnit(recipeIng.amount);

          let reductionAmount = 1; // default

          // Smart reduction based on units
          if (ingredient.unit === recipeUnit) {
            // Units match - use exact amount from recipe
            reductionAmount = recipeAmount;
          } else if ((ingredient.unit === "grams" || ingredient.unit === "ml") && (recipeUnit === "grams" || recipeUnit === "ml")) {
            // Both are weight/volume - use recipe amount
            reductionAmount = recipeAmount;
          } else if (ingredient.unit === "kg" && recipeUnit === "grams") {
            // Convert grams to kg
            reductionAmount = recipeAmount / 1000;
          } else if (ingredient.unit === "grams" && recipeUnit === "kg") {
            // Convert kg to grams
            reductionAmount = recipeAmount * 1000;
          } else if (ingredient.unit === "liters" && recipeUnit === "ml") {
            // Convert ml to liters
            reductionAmount = recipeAmount / 1000;
          } else if (ingredient.unit === "ml" && recipeUnit === "liters") {
            // Convert liters to ml
            reductionAmount = recipeAmount * 1000;
          } else if (ingredient.unit === "pieces") {
            // Pieces - reduce by recipe amount or 1
            reductionAmount = Math.max(1, Math.floor(recipeAmount));
          } else {
            // Different units - make a reasonable guess
            if (ingredient.unit === "grams" || ingredient.unit === "ml") {
              reductionAmount = Math.min(100, currentQty * 0.1); // 10% or 100g
            } else {
              reductionAmount = 1;
            }
          }

          const newQty = Math.max(0, currentQty - reductionAmount);
          ingredient.quantity = newQty.toString();
          ingredient.lastUpdated = new Date();
          await ingredient.save();
        }
      });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Recipe cooked and ingredients updated!",
    });
  } catch (error) {
    console.error("Error cooking recipe:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
