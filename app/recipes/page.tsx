"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChefHat, Clock, Flame, Users, Sparkles, X, Check, ShoppingCart, Share2, Heart, History } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

interface Ingredient {
  _id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

interface RecipeIngredient {
  name: string;
  amount: string;
  fromKitchen: boolean;
}

interface Recipe {
  _id?: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  isFavorite?: boolean;
}

export default function RecipesPage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [showCookModal, setShowCookModal] = useState(false);
  const [recipeToCheck, setRecipeToCheck] = useState<Recipe | null>(null);
  const [cooking, setCooking] = useState(false);

  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [savingRecipe, setSavingRecipe] = useState<string | null>(null);

  // Filters
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [maxCalories, setMaxCalories] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [maxCookingTime, setMaxCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [mealType, setMealType] = useState("");

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch ingredients");
      }

      setIngredients(data.ingredients);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load ingredients");
      toast.error("Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions((prev) => (prev.includes(restriction) ? prev.filter((r) => r !== restriction) : [...prev, restriction]));
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error("Please add ingredients to your kitchen first");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const ingredientNames = ingredients.map((ing) => ing.name);

      const filters: {
        dietaryRestrictions?: string[];
        maxCalories?: number;
        cuisine?: string;
        cookingTime?: number;
        servings?: number;
        mealType?: string;
      } = {};

      if (dietaryRestrictions.length > 0) filters.dietaryRestrictions = dietaryRestrictions;
      if (maxCalories) filters.maxCalories = parseInt(maxCalories);
      if (cuisine) filters.cuisine = cuisine;
      if (maxCookingTime) filters.cookingTime = parseInt(maxCookingTime);
      if (servings) filters.servings = parseInt(servings);
      if (mealType) filters.mealType = mealType;

      const response = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredientNames,
          filters,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipes");
      }

      if (data.recipes.length === 0) {
        toast.error("No recipes found with your criteria. Try adjusting filters.");
      } else {
        toast.success(`${data.recipes.length} recipes generated!`);
      }

      setRecipes(data.recipes);
    } catch (err) {
      console.error("Generate error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to generate recipes";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const saveRecipe = async (recipe: Recipe, index: number) => {
    const recipeKey = `${recipe.name}-${index}`;

    if (savedRecipes.has(recipeKey)) {
      toast("Recipe already saved!", { icon: "❤️" });
      return;
    }

    setSavingRecipe(recipeKey);

    try {
      const response = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) throw new Error("Failed to save recipe");

      setSavedRecipes((prev) => new Set(prev).add(recipeKey));
      toast.success("Recipe saved to favorites!");
    } catch (err) {
      toast.error("Failed to save recipe");
    } finally {
      setSavingRecipe(null);
    }
  };

  const cookNow = async (recipe: Recipe) => {
    setRecipeToCheck(recipe);
    setShowCookModal(true);
  };

  const handleCookConfirm = async () => {
    if (!recipeToCheck) return;

    setCooking(true);
    try {
      const response = await fetch("/api/recipes/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: recipeToCheck }),
      });

      if (!response.ok) throw new Error("Failed to cook recipe");

      toast.success("Ingredients updated! Enjoy cooking!");
      await fetchIngredients(); // Refresh ingredients
      setShowCookModal(false);
      setRecipeToCheck(null);
    } catch (err) {
      toast.error("Failed to update ingredients");
    } finally {
      setCooking(false);
    }
  };

  const shareRecipe = (recipe: Recipe) => {
    const recipeText = `Check out this recipe: ${recipe.name}\n\n${recipe.description}`;

    if (navigator.share) {
      navigator
        .share({
          title: recipe.name,
          text: recipeText,
        })
        .catch(() => {
          // Fallback to clipboard
          navigator.clipboard.writeText(recipeText);
          toast.success("Recipe copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(recipeText);
      toast.success("Recipe copied to clipboard!");
    }
  };

  const getMatchPercentage = (recipe: Recipe) => {
    const totalIngredients = recipe.ingredients.length;

    // Check each ingredient against actual kitchen inventory
    const availableCount = recipe.ingredients.filter((recipeIng) => {
      if (!recipeIng.fromKitchen) return false;

      // Find the ingredient in our kitchen
      const kitchenIng = ingredients.find((ing) => ing.name.toLowerCase() === recipeIng.name.toLowerCase());

      // Only count as available if it exists AND quantity > 0
      return kitchenIng && parseFloat(kitchenIng.quantity) > 0;
    }).length;

    return Math.round((availableCount / totalIngredients) * 100);
  };

  const dietaryOptions = ["Vegetarian", "Vegan", "Pescatarian", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Nut-Free"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#372f29] mx-auto mb-4" />
          <p className="text-gray-600">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd] py-12 px-4">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#372f29] to-[#211b16] rounded-2xl mb-4 shadow-lg">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">AI Recipe Generator</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">Get personalized recipes based on what is in your kitchen</p>

          {/* Quick Links */}
          <div className="flex gap-3 justify-center">
            <Link href="/favorites">
              <Button variant="outline" size="sm" className="cursor-pointer bg-[#ebe6de] hover:bg-[#ded8c5]">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" size="sm" className="cursor-pointer bg-[#ebe6de] hover:bg-[#ded8c5]">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-center">
              <X className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {ingredients.length === 0 ? (
          <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-[#ded8c5]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ded8c5] rounded-full mb-6">
              <ChefHat className="h-10 w-10 text-[#372f29]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Ingredients Yet</h3>
            <p className="text-gray-600 mb-8">Add ingredients to your kitchen first to generate personalized recipes</p>
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all text-white">
                <Sparkles className="mr-2 h-5 w-5" />
                Add Ingredients
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-8 mb-8 border border-[#ded8c5] max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#ded8c5] p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-[#372f29]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Customize Your Recipes</h2>
              </div>

              <div className="space-y-6">
                {/* Dietary Restrictions */}
                <div>
                  <label className="block font-semibold text-gray-900 mb-3">Dietary Preferences (All recipes are Halal by default)</label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((option) => (
                      <button key={option} onClick={() => toggleDietaryRestriction(option)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${dietaryRestrictions.includes(option) ? "bg-gradient-to-r from-[#372f29] to-[#211b16] text-white shadow-lg scale-105" : "bg-[#f0eae3] text-[#372f29] hover:bg-[#ded8c5] border border-[#ded8c5]"}`}>
                        {dietaryRestrictions.includes(option) && <Check className="inline h-4 w-4 mr-1" />}
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Meal Type */}
                <div className="mb-4">
                  <label className="block font-semibold text-gray-900 mb-3">Meal Type</label>
                  <div className="flex flex-wrap gap-2">
                    {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].map((type) => (
                      <button key={type} onClick={() => setMealType(mealType === type ? "" : type)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${mealType === type ? "bg-gradient-to-r from-[#372f29] to-[#211b16] text-white shadow-lg scale-105" : "bg-[#f0eae3] text-[#372f29] hover:bg-[#ded8c5] border border-[#ded8c5]"}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Other Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">Servings</label>
                    <Input type="number" placeholder="e.g., 4" value={servings} onChange={(e) => setServings(e.target.value)} className="border-[#ded8c5] focus:border-[#372f29] bg-[#f0eae3]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">Max Calories (per serving)</label>
                    <Input type="number" placeholder="e.g., 500" value={maxCalories} onChange={(e) => setMaxCalories(e.target.value)} className="border-[#ded8c5] focus:border-[#372f29] bg-[#f0eae3]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">Cuisine Type</label>
                    <Input placeholder="e.g., Italian, Mexican" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="border-[#ded8c5] focus:border-[#372f29] bg-[#f0eae3]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2">Max Cooking Time (min)</label>
                    <Input type="number" placeholder="e.g., 30" value={maxCookingTime} onChange={(e) => setMaxCookingTime(e.target.value)} className="border-[#ded8c5] focus:border-[#372f29] bg-[#f0eae3]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={generateRecipes} disabled={generating} size="lg" className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all px-12 text-white">
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Recipes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Recipes
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Available Ingredients Summary */}
            <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-6 mb-8 border border-[#ded8c5] max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Your Ingredients ({ingredients.length})</h3>
                <Link href="/kitchen">
                  <Button variant="outline" size="sm" className="cursor-pointer bg-[#372f29] border-[#372f29] text-white hover:bg-[#211b16] hover:text-white">
                    Manage Kitchen
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing) => (
                  <span key={ing._id} className="px-3 py-1.5 bg-[#f0eae3] border border-[#ded8c5] text-[#372f29] rounded-full text-sm font-medium">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Empty State After Generation */}
            {!generating && recipes.length === 0 && ingredients.length > 0 && (
              <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-12 text-center max-w-3xl mx-auto border border-[#ded8c5]">
                <Sparkles className="h-16 w-16 text-[#372f29] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Create Magic?</h3>
                <p className="text-gray-600 mb-6">Click Generate Recipes above to get personalized recipe suggestions based on your ingredients!</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    💡 <strong>Tip:</strong> Add dietary preferences for better matches
                  </p>
                  <p>
                    ⚡ <strong>Pro Tip:</strong> More ingredients = more recipe options!
                  </p>
                </div>
              </div>
            )}

            {/* Recipes Display */}
            {recipes.length > 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Recipes</h2>
                  <p className="text-gray-600">AI-generated recipes based on your ingredients</p>
                </div>

                {recipes.map((recipe, index) => {
                  const matchPercent = getMatchPercentage(recipe);
                  const missingIngredients = recipe.ingredients.filter((ing) => !ing.fromKitchen);

                  return (
                    <div key={index} className="bg-[#ebe6de] rounded-2xl shadow-xl overflow-hidden border border-[#ded8c5] max-w-5xl mx-auto hover:shadow-2xl transition-shadow">
                      {/* Recipe Header */}
                      <div className="bg-gradient-to-r from-[#372f29] to-[#211b16] p-6 text-white relative">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-3xl font-bold mb-2">{recipe.name}</h3>
                            <p className="text-[#ded8c5] text-lg">{recipe.description}</p>
                          </div>

                          {/* Match Badge */}
                          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                            <span className="text-white font-bold text-lg">{matchPercent}% Match</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {(() => {
                            const recipeKey = `${recipe.name}-${index}`;
                            const isSaved = savedRecipes.has(recipeKey);
                            const isSaving = savingRecipe === recipeKey;

                            return (
                              <Button onClick={() => saveRecipe(recipe, index)} size="sm" disabled={isSaved || isSaving} className={`cursor-pointer transition-all ${isSaved ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white border-white/30"}`}>
                                <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-white" : ""}`} />
                                {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Recipe"}
                              </Button>
                            );
                          })()}
                          <Button onClick={() => cookNow(recipe)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 cursor-pointer">
                            <ChefHat className="h-4 w-4 mr-2" />
                            Cook This Now
                          </Button>
                          <Button onClick={() => shareRecipe(recipe)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 cursor-pointer">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>

                      <div className="p-8">
                        {/* Recipe Meta Info */}
                        <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-[#ded8c5]">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#ded8c5] p-2 rounded-lg">
                              <Clock className="h-5 w-5 text-[#372f29]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Prep Time</p>
                              <p className="font-semibold text-gray-900">{recipe.prepTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#ded8c5] p-2 rounded-lg">
                              <Clock className="h-5 w-5 text-[#372f29]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cook Time</p>
                              <p className="font-semibold text-gray-900">{recipe.cookTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#ded8c5] p-2 rounded-lg">
                              <Users className="h-5 w-5 text-[#372f29]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Servings</p>
                              <p className="font-semibold text-gray-900">{recipe.servings}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-[#ded8c5] p-2 rounded-lg">
                              <Flame className="h-5 w-5 text-[#372f29]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Calories</p>
                              <p className="font-semibold text-gray-900">{recipe.calories} cal</p>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {recipe.tags && recipe.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {recipe.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-3 py-1 bg-[#f0eae3] text-[#372f29] rounded-full text-sm font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Missing Ingredients Alert */}
                        {missingIngredients.length > 0 && (
                          <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-orange-900 mb-2">You will need to buy {missingIngredients.length} item(s):</h4>
                                <div className="flex flex-wrap gap-2">
                                  {missingIngredients.map((ing, idx) => (
                                    <span key={idx} className="text-sm text-orange-800">
                                      {ing.amount} {ing.name}
                                      {idx < missingIngredients.length - 1 && ","}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <Button size="sm" variant="outline" className="ml-4 bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200 cursor-pointer whitespace-nowrap" onClick={() => toast("Shopping list feature coming soon!", { icon: "📋" })}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to List
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Ingredients */}
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-[#372f29]" />
                            Ingredients
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {recipe.ingredients.map((ing, ingIndex) => (
                              <div key={ingIndex} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${ing.fromKitchen ? "bg-[#f0eae3] border-[#372f29]" : "bg-[#ece7e0] border-[#ded8c5]"}`}>
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${ing.fromKitchen ? "bg-[#372f29]" : "bg-[#211b16]"}`}>{ing.fromKitchen ? <Check className="h-4 w-4 text-white" /> : <ShoppingCart className="h-4 w-4 text-white" />}</div>
                                <div className="flex-1">
                                  <span className={`font-medium ${ing.fromKitchen ? "text-[#211b16]" : "text-[#372f29]"}`}>
                                    {ing.amount} {ing.name}
                                  </span>
                                  {!ing.fromKitchen && <span className="text-xs text-[#372f29] ml-2">(need to buy)</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instructions */}
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-4">Instructions</h4>
                          <div className="space-y-4">
                            {recipe.instructions.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#372f29] to-[#211b16] text-white rounded-full flex items-center justify-center font-bold">{stepIndex + 1}</div>
                                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmModal
        isOpen={showCookModal}
        onClose={() => {
          setShowCookModal(false);
          setRecipeToCheck(null);
        }}
        onConfirm={handleCookConfirm}
        title="Cook This Recipe?"
        message={`Are you ready to cook "${recipeToCheck?.name}"? This will update your ingredient quantities based on what's used in the recipe.`}
        confirmText="Let's Cook!"
        cancelText="Not Yet"
        isLoading={cooking}
      />
    </div>
  );
}
