// Parse amount from recipe ingredient (e.g., "200g" -> 200, "2 cups" -> 2)
export function parseAmount(amountString: string): number {
  const match = amountString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 1;
}

// Get unit from amount string (e.g., "200g" -> "grams", "2 pieces" -> "pieces")
export function extractUnit(amountString: string): string {
  const lowerAmount = amountString.toLowerCase();

  // Check for units - be specific to avoid false matches
  if (/\d+\s*g\b/.test(lowerAmount) || /gram/i.test(lowerAmount)) return "grams";
  if (/\bkg\b/i.test(lowerAmount) || /kilo/i.test(lowerAmount)) return "kg";
  if (/\bml\b/i.test(lowerAmount) || /milliliter/i.test(lowerAmount)) return "ml";
  if (/liter/i.test(lowerAmount) && !/milliliter/i.test(lowerAmount)) return "liters";
  if (/\boz\b/i.test(lowerAmount) || /ounce/i.test(lowerAmount)) return "oz";
  if (/\blb/i.test(lowerAmount) || /pound/i.test(lowerAmount)) return "lbs";
  if (/cup/i.test(lowerAmount)) return "cups";
  if (/tbsp/i.test(lowerAmount) || /tablespoon/i.test(lowerAmount)) return "tbsp";
  if (/tsp/i.test(lowerAmount) || /teaspoon/i.test(lowerAmount)) return "tsp";
  if (/piece/i.test(lowerAmount) || /\bpc/i.test(lowerAmount)) return "pieces";

  return "pieces"; // default
}
