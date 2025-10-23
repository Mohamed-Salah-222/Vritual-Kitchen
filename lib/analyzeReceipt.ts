import openai from "./openai";

interface AnalyzedIngredient {
  name: string;
  quantity: string;
  unit: string;
  category: "protein" | "carbs" | "vegetables" | "fruits" | "dairy" | "spices" | "oils" | "sweets" | "other";
}

export async function analyzeReceipt(imageBase64: string): Promise<AnalyzedIngredient[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a grocery receipt analyzer. Extract all food items from the receipt image.

For each item on the receipt, determine:
- name: The food/ingredient name (clean and standardized, e.g., "Tomatoes" not "TOMATOES FRESH")
- quantity: Estimate reasonable quantity based on typical purchase (e.g., if receipt shows "Chicken Breast", estimate "500")
- unit: Use one of: grams, kg, pieces, cups, tbsp, tsp, ml, liters, oz, lbs
- category: Must be one of: protein, carbs, vegetables, fruits, dairy, spices, oils, sweets, other

CRITICAL RULES:
- Extract ONLY food and grocery items (ignore non-food items like paper towels, cleaners)
- If quantity isn't clear on receipt, make reasonable estimates (e.g., bread = 1 pieces, milk = 1 liters)
- Standardize names (remove brand names, clean up formatting)
- Use only the allowed units
- If NO food items visible, return empty array: []

Return ONLY a valid JSON array with no markdown formatting.

Example:
[
  {"name": "Chicken Breast", "quantity": "500", "unit": "grams", "category": "protein"},
  {"name": "Milk", "quantity": "1", "unit": "liters", "category": "dairy"},
  {"name": "Bananas", "quantity": "6", "unit": "pieces", "category": "fruits"}
]

If no food items found, return: []`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: "Extract all food items from this receipt and return as JSON.",
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let cleanedContent = content.trim();

    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    cleanedContent = cleanedContent.trim();

    if (!cleanedContent.startsWith("[") && !cleanedContent.startsWith("{")) {
      console.warn("AI returned plain text instead of JSON");
      return [];
    }

    let ingredients: AnalyzedIngredient[];
    try {
      ingredients = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn("Failed to parse JSON, returning empty array");
      return [];
    }

    const validUnits = ["grams", "kg", "pieces", "cups", "tbsp", "tsp", "ml", "liters", "oz", "lbs"];
    const fixedIngredients = ingredients.map((ing) => {
      if (!validUnits.includes(ing.unit)) {
        console.warn(`Invalid unit detected: ${ing.unit}, defaulting to "pieces"`);
        return { ...ing, unit: "pieces" };
      }
      return ing;
    });

    return fixedIngredients;
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
