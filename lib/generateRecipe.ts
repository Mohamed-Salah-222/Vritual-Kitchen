import openai from "./openai";

interface RecipeFilters {
  dietaryRestrictions?: string[];
  maxCalories?: number;
  cuisine?: string;
  cookingTime?: number;
  servings?: number;
  mealType?: string;
}

interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  ingredients: {
    name: string;
    amount: string;
    fromKitchen: boolean; // true if user has this ingredient
  }[];
  instructions: string[];
  tags: string[];
}

export async function generateRecipes(
  availableIngredients: string[], // Just the names of ingredients user has
  filters?: RecipeFilters
): Promise<Recipe[]> {
  try {
    const filterText = filters
      ? `
Dietary Restrictions: ${filters.dietaryRestrictions?.join(", ") || "None"}
Max Calories: ${filters.maxCalories || "No limit"}
Cuisine Preference: ${filters.cuisine || "Any"}
Max Cooking Time: ${filters.cookingTime ? `${filters.cookingTime} minutes` : "No limit"}
Servings: ${filters.servings || "Any"}
Meal Type: ${filters.mealType || "Any"}
`
      : "No specific filters";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional chef and recipe creator. Generate 3-5 recipe suggestions based on available ingredients.

Rules:
- PRIORITIZE recipes that use ONLY the available ingredients - this is most important!
- Only suggest additional ingredients if absolutely necessary (like salt, pepper, oil which are common staples)
- Try to create at least 2-3 recipes that use ONLY available ingredients with no additional purchases
- If you must suggest buying something, it should be 1-2 common items maximum
- Mark ingredients accurately: fromKitchen: true for available, fromKitchen: false for items to buy
- Respect all dietary restrictions and filters strictly
- If a meal type is specified (Breakfast, Lunch, Dinner, Snack, Dessert), generate appropriate recipes for that meal
- ALL RECIPES MUST BE HALAL by default (no pork, no alcohol in cooking)
- Be creative but practical with available ingredients
- Provide accurate calorie estimates

CRITICAL: Return ONLY a valid JSON array with no markdown formatting, no backticks, no code blocks, no additional text.
Your response must start with [ and end with ].

Example format:
[
  {
    "name": "Grilled Chicken Salad",
    "description": "A fresh and healthy salad with grilled chicken",
    "prepTime": "15 minutes",
    "cookTime": "20 minutes",
    "servings": 2,
    "calories": 350,
    "ingredients": [
      {"name": "Chicken Breast", "amount": "200g", "fromKitchen": true},
      {"name": "Lettuce", "amount": "2 cups", "fromKitchen": true}
    ],
    "instructions": [
      "Season the chicken breast with salt and pepper",
      "Grill chicken for 8-10 minutes per side",
      "Chop lettuce and prepare salad",
      "Slice grilled chicken and place on salad"
    ],
    "tags": ["healthy", "protein-rich", "quick"]
  }
]`,
        },
        {
          role: "user",
          content: `Generate recipe suggestions using these available ingredients:
${availableIngredients.join(", ")}

Filters:
${filterText}

Provide 3-5 diverse recipe options in JSON format.`,
        },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let cleanedContent = content.trim();

    // Remove markdown code blocks if present
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    cleanedContent = cleanedContent.trim();

    // Check if response starts with valid JSON
    if (!cleanedContent.startsWith("[") && !cleanedContent.startsWith("{")) {
      console.warn("AI returned non-JSON response:", cleanedContent);
      throw new Error("Invalid response format from AI");
    }

    // Parse the JSON response
    const recipes: Recipe[] = JSON.parse(cleanedContent);

    // Verify ingredient availability with actual quantities
    const recipesWithCorrectAvailability = recipes.map((recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients.map((recipeIng) => {
        const kitchenIng = availableIngredients.find((name) => name.toLowerCase() === recipeIng.name.toLowerCase());

        // Mark as available only if ingredient name matches
        return {
          ...recipeIng,
          fromKitchen: !!kitchenIng,
        };
      }),
    }));

    return recipesWithCorrectAvailability;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
}
