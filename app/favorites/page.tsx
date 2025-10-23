"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, X, Clock, Flame, Users, ChefHat, Share2, Trash2, Loader2, Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

interface RecipeIngredient {
  name: string;
  amount: string;
  fromKitchen: boolean;
}

interface Recipe {
  _id: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
}

export default function FavoritesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showCookModal, setShowCookModal] = useState(false);
  const [recipeToCheck, setRecipeToCheck] = useState<Recipe | null>(null);
  const [cooking, setCooking] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/recipes/favorites");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch favorites");
      }

      setRecipes(data.recipes);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (recipeId: string) => {
    if (!confirm("Remove this recipe from favorites?")) return;

    try {
      const response = await fetch(`/api/recipes/favorites/${recipeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove recipe");

      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
      setSelectedRecipe(null);
      toast.success("Recipe removed from favorites");
    } catch (err) {
      toast.error("Failed to remove recipe");
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
      setShowCookModal(false);
      setRecipeToCheck(null);
      setSelectedRecipe(null);
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
          navigator.clipboard.writeText(recipeText);
          toast.success("Recipe copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(recipeText);
      toast.success("Recipe copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#372f29] mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
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
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
          <div className="mb-6">
            <Link href="/recipes">
              <Button variant="outline" className="cursor-pointer bg-[#ebe6de] border-[#ded8c5] hover:bg-[#ded8c5] hover:border-[#372f29]">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Recipes
              </Button>
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Favorite Recipes</h1>
          <p className="text-lg text-gray-600">Your saved recipes collection</p>
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-16 text-center max-w-2xl mx-auto border border-[#ded8c5]">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Favorites Yet</h3>
            <p className="text-gray-600 mb-8">Start saving recipes you love and they will appear here!</p>
            <Link href="/recipes">
              <Button className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] text-white cursor-pointer">Discover Recipes</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe._id} onClick={() => setSelectedRecipe(recipe)} className="bg-[#ebe6de] rounded-xl border-2 border-[#ded8c5] hover:border-[#372f29] shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                <div className="bg-gradient-to-r from-[#372f29] to-[#211b16] p-4">
                  <h3 className="text-xl font-bold text-white mb-1">{recipe.name}</h3>
                  <p className="text-[#ded8c5] text-sm line-clamp-2">{recipe.description}</p>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <Clock className="h-4 w-4 text-[#372f29] mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{recipe.prepTime}</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-4 w-4 text-[#372f29] mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{recipe.servings} servings</p>
                    </div>
                    <div className="text-center">
                      <Flame className="h-4 w-4 text-[#372f29] mx-auto mb-1" />
                      <p className="text-xs text-gray-600">{recipe.calories} cal</p>
                    </div>
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#ded8c5] text-[#372f29] rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRecipe(null)}>
            <div className="bg-[#ebe6de] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#372f29] to-[#211b16] p-6 text-white z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">{selectedRecipe.name}</h2>
                    <p className="text-[#ded8c5]">{selectedRecipe.description}</p>
                  </div>
                  <button onClick={() => setSelectedRecipe(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button onClick={() => cookNow(selectedRecipe)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 cursor-pointer">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Cook This Now
                  </Button>
                  <Button onClick={() => shareRecipe(selectedRecipe)} size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30 cursor-pointer">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={() => removeFromFavorites(selectedRecipe._id)} size="sm" className="bg-red-500/80 hover:bg-red-600 text-white cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Recipe Meta */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-[#ded8c5]">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#ded8c5] p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-[#372f29]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Prep Time</p>
                      <p className="font-semibold text-gray-900">{selectedRecipe.prepTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#ded8c5] p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-[#372f29]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cook Time</p>
                      <p className="font-semibold text-gray-900">{selectedRecipe.cookTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#ded8c5] p-2 rounded-lg">
                      <Users className="h-5 w-5 text-[#372f29]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Servings</p>
                      <p className="font-semibold text-gray-900">{selectedRecipe.servings}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#ded8c5] p-2 rounded-lg">
                      <Flame className="h-5 w-5 text-[#372f29]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Calories</p>
                      <p className="font-semibold text-gray-900">{selectedRecipe.calories} cal</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedRecipe.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#f0eae3] text-[#372f29] rounded-full text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ingredients */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#372f29]" />
                    Ingredients
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${ing.fromKitchen ? "bg-[#f0eae3] border-[#372f29]" : "bg-[#ece7e0] border-[#ded8c5]"}`}>
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${ing.fromKitchen ? "bg-[#372f29]" : "bg-[#211b16]"}`}>{ing.fromKitchen ? <Check className="h-4 w-4 text-white" /> : <ShoppingCart className="h-4 w-4 text-white" />}</div>
                        <span className="font-medium text-gray-900">
                          {ing.amount} {ing.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#372f29] to-[#211b16] text-white rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Cook Confirmation Modal */}
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
