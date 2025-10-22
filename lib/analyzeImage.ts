import openai from "./openai";

interface AnalyzedIngredient {
  name: string;
  quantity: string;
  unit: string;
  category: "protein" | "carbs" | "vegetables" | "fruits" | "dairy" | "spices" | "oils" | "sweets" | "other";
  emoji: string;
}

export async function analyzeKitchenImage(imageBase64: string): Promise<AnalyzedIngredient[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a kitchen ingredient analyzer. Analyze the image and identify all food items, ingredients, and groceries visible.
          
For each item, determine:
- name: The specific name of the ingredient
- quantity: Estimated amount as a NUMBER ONLY (e.g., "500" not "500g", "2" not "2 pieces")
- unit: MUST be EXACTLY one of these (no other values allowed): grams, kg, pieces, cups, tbsp, tsp, ml, liters, oz, lbs
- category: Must be one of: protein, carbs, vegetables, fruits, dairy, spices, oils, sweets, other
- emoji: A single relevant emoji that represents this ingredient (e.g., 🍗 for chicken, 🍅 for tomato, 🥕 for carrot)

CRITICAL RULES:
- For the unit field, you MUST use ONLY these exact words: grams, kg, pieces, cups, tbsp, tsp, ml, liters, oz, lbs
- If you're unsure about quantity, estimate reasonably and use "pieces" as the unit
- Never use words like "bunch", "handful", "bag", "box" - convert these to pieces or grams
- Quantity must be a number only, no units in the quantity field
- Choose the most accurate emoji for each ingredient
- If NO food or ingredients are visible in the image, return an empty array: []
- DO NOT return plain text explanations. ONLY return valid JSON.

Return ONLY a valid JSON array with no markdown formatting, no backticks, no code blocks, no additional text.
Your response must start with [ and end with ].

Example format:
[
  {"name": "Chicken Breast", "quantity": "500", "unit": "grams", "category": "protein", "emoji": "🍗"},
  {"name": "Tomatoes", "quantity": "4", "unit": "pieces", "category": "vegetables", "emoji": "🍅"},
  {"name": "Bananas", "quantity": "6", "unit": "pieces", "category": "fruits", "emoji": "🍌"}
]

If no food/ingredients visible, return: []`,
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
              text: "Analyze this kitchen image and list all visible ingredients in JSON format.",
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
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

    // Check if response is not JSON (plain text explanation)
    if (!cleanedContent.startsWith("[") && !cleanedContent.startsWith("{")) {
      console.warn("AI returned plain text instead of JSON:", cleanedContent);
      // Return empty array if no ingredients found
      return [];
    }

    // Try to parse JSON
    let ingredients: AnalyzedIngredient[];
    try {
      ingredients = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.warn("Failed to parse JSON, returning empty array");
      // If parse fails and content suggests no ingredients, return empty array
      if (cleanedContent.toLowerCase().includes("can't") || cleanedContent.toLowerCase().includes("no") || cleanedContent.toLowerCase().includes("unable")) {
        return [];
      }
      throw new Error("Invalid response format from AI");
    }

    // Validate and fix any invalid units
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
    console.error("Error analyzing image:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
