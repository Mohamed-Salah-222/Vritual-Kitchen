"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Edit2, Trash2, Plus, Search, Package, ChefHat, Upload as UploadIcon, Sparkles, Flag, Minus, Check, X as XIcon, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface Ingredient {
  _id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  emoji: string;
  isEssential: boolean;
}

export default function KitchenPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

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

  const updateIngredient = async (id: string, field: keyof Ingredient, value: string | boolean) => {
    setIngredients((prev) => prev.map((ing) => (ing._id === id ? { ...ing, [field]: value } : ing)));
  };

  const saveEdit = async (id: string) => {
    const ingredient = ingredients.find((ing) => ing._id === id);
    if (!ingredient) return;

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ingredient),
      });

      if (!response.ok) {
        throw new Error("Failed to update ingredient");
      }

      setEditingId(null);
      toast.success("Ingredient updated!");
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update ingredient");
      toast.error("Failed to update ingredient");
    }
  };

  const deleteIngredient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ingredient?")) return;

    try {
      const response = await fetch(`/api/ingredients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ingredient");
      }

      setIngredients((prev) => prev.filter((ing) => ing._id !== id));
      toast.success("Ingredient deleted!");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete ingredient");
      toast.error("Failed to delete ingredient");
    }
  };

  const adjustQuantity = async (id: string, adjustment: number) => {
    const ingredient = ingredients.find((ing) => ing._id === id);
    if (!ingredient) return;

    const currentQty = parseFloat(ingredient.quantity);
    const newQty = Math.max(0, currentQty + adjustment);

    if (newQty === 0) {
      if (confirm("Quantity will be 0. Delete this ingredient?")) {
        await deleteIngredient(id);
      }
      return;
    }

    // Optimistic update - update UI immediately
    setIngredients((prev) => prev.map((ing) => (ing._id === id ? { ...ing, quantity: newQty.toString() } : ing)));

    // Then sync with backend
    try {
      const updatedIngredient = { ...ingredient, quantity: newQty.toString() };

      const response = await fetch(`/api/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedIngredient),
      });

      if (!response.ok) {
        // Revert on error
        setIngredients((prev) => prev.map((ing) => (ing._id === id ? { ...ing, quantity: currentQty.toString() } : ing)));
        throw new Error("Failed to update quantity");
      }
    } catch (err) {
      console.error("Update quantity error:", err);
      toast.error("Failed to update quantity");
    }
  };

  const toggleEssential = async (id: string) => {
    const ingredient = ingredients.find((ing) => ing._id === id);
    if (!ingredient) return;

    try {
      const updatedIngredient = { ...ingredient, isEssential: !ingredient.isEssential };

      const response = await fetch(`/api/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedIngredient),
      });

      if (!response.ok) throw new Error("Failed to update essential status");

      setIngredients((prev) => prev.map((ing) => (ing._id === id ? { ...ing, isEssential: !ing.isEssential } : ing)));

      toast.success(ingredient.isEssential ? "Removed from essentials" : "Marked as essential!");

      // Check if we should add to shopping list
      await checkAndAddToShoppingList(ingredient);
    } catch (err) {
      console.error("Toggle essential error:", err);
      toast.error("Failed to update essential status");
    }
  };

  const checkAndAddToShoppingList = async (ingredient: Ingredient) => {
    // If marking as essential and quantity is 0, add to shopping list
    if (!ingredient.isEssential && parseFloat(ingredient.quantity) === 0) {
      try {
        const response = await fetch("/api/shopping-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ingredient.name,
            quantity: "1",
            unit: ingredient.unit,
            category: ingredient.category,
          }),
        });

        if (response.ok) {
          toast.success(`${ingredient.name} added to shopping list!`);
        }
      } catch (err) {
        // Silently fail - already marked as essential
        console.log("Item might already be in shopping list");
      }
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = filteredIngredients.map((ing) => ing._id);
      setSelectedItems(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  const batchDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    if (!confirm(`Delete ${selectedItems.size} selected item(s)?`)) return;

    try {
      const response = await fetch("/api/ingredients/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedItems) }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete items");
      }

      setIngredients((prev) => prev.filter((ing) => !selectedItems.has(ing._id)));
      setSelectedItems(new Set());
      setSelectAll(false);
      toast.success(`${selectedItems.size} items deleted!`);
    } catch (err) {
      console.error("Batch delete error:", err);
      toast.error("Failed to delete items");
    }
  };

  const addNewIngredient = async () => {
    const newIngredient = {
      name: "New Ingredient",
      quantity: "1",
      unit: "pieces",
      category: "other",
      emoji: "📦",
    };

    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: [newIngredient] }),
      });

      if (!response.ok) {
        throw new Error("Failed to add ingredient");
      }

      await fetchIngredients();
      toast.success("New ingredient added!");
    } catch (err) {
      console.error("Add error:", err);
      setError(err instanceof Error ? err.message : "Failed to add ingredient");
      toast.error("Failed to add ingredient");
    }
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group ingredients by category
  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const categories = [
    { value: "all", label: "All Items" },
    { value: "protein", label: "Protein" },
    { value: "carbs", label: "Carbs" },
    { value: "vegetables", label: "Vegetables" },
    { value: "fruits", label: "Fruits" },
    { value: "dairy", label: "Dairy" },
    { value: "spices", label: "Spices" },
    { value: "oils", label: "Oils" },
    { value: "sweets", label: "Sweets" },
    { value: "other", label: "Other" },
  ];

  const categoryOrder = ["protein", "vegetables", "fruits", "carbs", "dairy", "spices", "oils", "sweets", "other"];

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    ingredients.forEach((ing) => {
      stats[ing.category] = (stats[ing.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  // Low stock essentials
  const lowStockEssentials = ingredients.filter((ing) => ing.isEssential && parseFloat(ing.quantity) <= 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#372f29] mx-auto mb-4" />
          <p className="text-gray-600">Loading your kitchen...</p>
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
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">My Virtual Kitchen</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Manage your ingredients and track what is in your kitchen</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all text-white">
                <UploadIcon className="mr-2 h-5 w-5" />
                Add More Items
              </Button>
            </Link>
            <Link href="/recipes">
              <Button className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all text-white">
                <ChefHat className="mr-2 h-5 w-5" />
                Generate Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockEssentials.length > 0 && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">Low Stock Alert</h3>
                  <p className="text-sm text-orange-800 mb-2">These essential items are running low:</p>
                  <div className="flex flex-wrap gap-2">
                    {lowStockEssentials.map((ing) => (
                      <span key={ing._id} className="px-3 py-1 bg-orange-100 text-orange-900 rounded-full text-sm font-medium">
                        {ing.name} ({ing.quantity} {ing.unit})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-4xl mx-auto">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-[#ebe6de] rounded-2xl shadow-xl border border-[#ded8c5] overflow-hidden max-w-6xl mx-auto">
          {/* Search & Filter Bar */}
          <div className="p-6 bg-gradient-to-r from-[#f0eae3] to-[#ece7e0] border-b border-[#ded8c5]">
            <div className="flex flex-col gap-4">
              {/* Top Row: Search + Add Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input placeholder="Search ingredients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-[#ebe6de] border-[#ded8c5] focus:border-[#372f29] focus:ring-[#372f29]" />
                </div>

                <Button onClick={addNewIngredient} className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer whitespace-nowrap text-white">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat.value} onClick={() => setSelectedCategory(cat.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedCategory === cat.value ? "bg-[#372f29] text-white shadow-lg scale-105" : "bg-[#ebe6de] text-[#372f29] border border-[#ded8c5] hover:border-[#372f29] hover:bg-[#ded8c5]"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Batch Mode Toggle */}
              {filteredIngredients.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-[#ebe6de] rounded-lg border border-[#ded8c5]">
                  <Button
                    onClick={() => {
                      setBatchMode(!batchMode);
                      if (batchMode) {
                        setSelectedItems(new Set());
                        setSelectAll(false);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer ${batchMode ? "bg-[#372f29] text-white hover:bg-[#211b16]" : "bg-[#ebe6de] hover:bg-[#ded8c5]"}`}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {batchMode ? "Exit Batch Mode" : "Batch Edit"}
                  </Button>

                  {batchMode && (
                    <>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 cursor-pointer accent-[#372f29]" />
                        <span className="text-sm font-medium text-gray-700">Select All ({selectedItems.size} selected)</span>
                      </div>

                      {selectedItems.size > 0 && (
                        <Button onClick={batchDelete} size="sm" className="bg-red-500 text-white hover:bg-red-600 cursor-pointer">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ingredients Display - Grouped by Category */}
          <div className="p-6">
            {filteredIngredients.length === 0 ? (
              <div className="text-center py-16">
                {ingredients.length === 0 ? (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ded8c5] rounded-full mb-4">
                      <Package className="h-10 w-10 text-[#372f29]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your kitchen is empty</h3>
                    <p className="text-gray-600 mb-6">Start by uploading images of your ingredients</p>
                    <Link href="/upload">
                      <Button className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer text-white">
                        <UploadIcon className="mr-2 h-5 w-5" />
                        Upload Kitchen Images
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No ingredients match your search</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {categoryOrder.map((categoryKey) => {
                  const categoryIngredients = groupedIngredients[categoryKey];
                  if (!categoryIngredients || categoryIngredients.length === 0) return null;

                  return (
                    <div key={categoryKey}>
                      {/* Category Header */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize border-b-2 border-[#372f29] pb-2">{categoryKey}</h2>

                      {/* Ingredients Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                        {categoryIngredients.map((ingredient) => (
                          <div key={ingredient._id} className={`relative group bg-gradient-to-br from-[#ebe6de] to-[#f0eae3] rounded-xl p-4 border-2 hover:shadow-lg transition-all min-h-[180px] flex flex-col ${ingredient.isEssential ? "border-yellow-500" : "border-[#ded8c5] hover:border-[#372f29]"}`}>
                            {/* Selection Checkbox - Only in Batch Mode */}
                            {batchMode && <input type="checkbox" checked={selectedItems.has(ingredient._id)} onChange={() => toggleSelectItem(ingredient._id)} className="absolute top-3 left-3 w-5 h-5 cursor-pointer accent-[#372f29] z-10" />}

                            {editingId === ingredient._id ? (
                              <div className="space-y-2 flex-1 flex flex-col">
                                <Input placeholder="Name" value={ingredient.name} onChange={(e) => updateIngredient(ingredient._id, "name", e.target.value)} className="text-sm" />
                                <Input placeholder="Qty" value={ingredient.quantity} onChange={(e) => updateIngredient(ingredient._id, "quantity", e.target.value)} className="text-sm" />
                                <select value={ingredient.unit} onChange={(e) => updateIngredient(ingredient._id, "unit", e.target.value)} className="w-full px-2 py-1 text-sm border rounded">
                                  <option value="grams">g</option>
                                  <option value="kg">kg</option>
                                  <option value="pieces">pcs</option>
                                  <option value="cups">cups</option>
                                  <option value="tbsp">tbsp</option>
                                  <option value="tsp">tsp</option>
                                  <option value="ml">ml</option>
                                  <option value="liters">L</option>
                                  <option value="oz">oz</option>
                                  <option value="lbs">lbs</option>
                                </select>
                                <div className="flex gap-1 mt-auto">
                                  <Button onClick={() => saveEdit(ingredient._id)} size="sm" className="flex-1 text-xs cursor-pointer bg-[#372f29] hover:bg-[#211b16] text-white">
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button onClick={() => setEditingId(null)} size="sm" variant="outline" className="flex-1 text-xs cursor-pointer">
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Action Buttons Row - Only on Hover */}
                                {!batchMode && (
                                  <div className="absolute top-2 left-2 right-2 flex justify-evenly gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={() => toggleEssential(ingredient._id)} className={`p-2 rounded-lg cursor-pointer shadow-md transition-all hover:scale-105 ${ingredient.isEssential ? "bg-yellow-500 hover:bg-yellow-600" : "bg-[#ded8c5] hover:bg-yellow-500"}`} title={ingredient.isEssential ? "Remove from essentials" : "Mark as essential"}>
                                      <Flag className={`h-4 w-4 ${ingredient.isEssential ? "text-white" : "text-yellow-600"}`} />
                                    </button>
                                    <button onClick={() => setEditingId(ingredient._id)} className="p-2 bg-[#372f29] hover:bg-[#211b16] text-white rounded-lg cursor-pointer shadow-md transition-all hover:scale-105" title="Edit">
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteIngredient(ingredient._id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer shadow-md transition-all hover:scale-105" title="Delete">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}

                                <div className="text-center flex-1 flex flex-col justify-center mt-8">
                                  <h3 className="font-bold text-gray-900 mb-2 break-words text-sm">{ingredient.name}</h3>
                                  <p className="text-sm text-[#372f29] font-semibold mb-3">
                                    {ingredient.quantity} {ingredient.unit}
                                  </p>

                                  {/* Quick Adjust Buttons */}
                                  {!batchMode && (
                                    <div className="flex gap-2 mt-auto">
                                      <button
                                        onClick={() => {
                                          const adjustment = ingredient.unit === "grams" ? -100 : -1;
                                          adjustQuantity(ingredient._id, adjustment);
                                        }}
                                        className="flex-1 py-2 bg-[#ded8c5] hover:bg-[#372f29] hover:text-white rounded-lg transition-colors cursor-pointer font-semibold"
                                        title="Decrease"
                                      >
                                        <Minus className="h-4 w-4 mx-auto" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const adjustment = ingredient.unit === "grams" ? 100 : 1;
                                          adjustQuantity(ingredient._id, adjustment);
                                        }}
                                        className="flex-1 py-2 bg-[#ded8c5] hover:bg-[#372f29] hover:text-white rounded-lg transition-colors cursor-pointer font-semibold"
                                        title="Increase"
                                      >
                                        <Plus className="h-4 w-4 mx-auto" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
