"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, ArrowLeft, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

interface ShoppingItem {
  _id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  isPurchased: boolean;
  addedAt: string;
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "1",
    unit: "pieces",
    category: "other",
  });

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const response = await fetch("/api/shopping-list");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shopping list");
      }

      setItems(data.items);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    try {
      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add item");
      }

      toast.success("Item added to shopping list!");
      setNewItem({ name: "", quantity: "1", unit: "pieces", category: "other" });
      setShowAddForm(false);
      await fetchShoppingList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const togglePurchased = async (id: string, isPurchased: boolean) => {
    try {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPurchased: !isPurchased }),
      });

      if (!response.ok) throw new Error("Failed to update item");

      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, isPurchased: !isPurchased } : item)));
      toast.success(isPurchased ? "Marked as not purchased" : "Marked as purchased!");
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Remove this item from shopping list?")) return;

    try {
      const response = await fetch(`/api/shopping-list/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");

      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Item removed!");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const clearPurchased = async () => {
    const purchasedCount = items.filter((item) => item.isPurchased).length;

    if (purchasedCount === 0) {
      toast.error("No purchased items to clear");
      return;
    }

    if (!confirm(`Clear ${purchasedCount} purchased item(s)?`)) return;

    try {
      const response = await fetch("/api/shopping-list/clear-purchased", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to clear purchased items");

      await fetchShoppingList();
      toast.success("Purchased items cleared!");
    } catch (err) {
      toast.error("Failed to clear items");
    }
  };

  const unpurchasedItems = items.filter((item) => !item.isPurchased);
  const purchasedItems = items.filter((item) => item.isPurchased);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#372f29] mx-auto mb-4" />
          <p className="text-gray-600">Loading your shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd] py-12 px-4">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#372f29] to-[#211b16] rounded-2xl mb-4 shadow-lg">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div className="mb-6">
            <Link href="/kitchen">
              <Button variant="outline" className="cursor-pointer bg-[#ebe6de] border-[#ded8c5] hover:bg-[#ded8c5] hover:border-[#372f29]">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Kitchen
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Shopping List</h1>
          <p className="text-lg text-gray-600">{unpurchasedItems.length} item(s) to buy</p>
        </div>

        {/* Add Item Button */}
        <div className="mb-6 text-center">
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] text-white cursor-pointer">
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-[#ebe6de] rounded-xl p-6 mb-6 border-2 border-[#ded8c5]">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="bg-[#f0eae3] border-[#ded8c5]" />
              <Input placeholder="Quantity" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className="bg-[#f0eae3] border-[#ded8c5]" />
              <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="px-3 py-2 border border-[#ded8c5] rounded-md bg-[#f0eae3]">
                <option value="grams">grams</option>
                <option value="kg">kg</option>
                <option value="pieces">pieces</option>
                <option value="cups">cups</option>
                <option value="tbsp">tbsp</option>
                <option value="tsp">tsp</option>
                <option value="ml">ml</option>
                <option value="liters">liters</option>
                <option value="oz">oz</option>
                <option value="lbs">lbs</option>
              </select>
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="px-3 py-2 border border-[#ded8c5] rounded-md bg-[#f0eae3]">
                <option value="protein">Protein</option>
                <option value="carbs">Carbs</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="dairy">Dairy</option>
                <option value="spices">Spices</option>
                <option value="oils">Oils</option>
                <option value="sweets">Sweets</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem} className="flex-1 bg-[#372f29] hover:bg-[#211b16] text-white cursor-pointer">
                Add Item
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1 cursor-pointer bg-[#f0eae3] hover:bg-[#ded8c5]">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-16 text-center border border-[#ded8c5]">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Shopping List is Empty</h3>
            <p className="text-gray-600 mb-4">Items will automatically appear here when essential ingredients run out</p>
            <p className="text-sm text-gray-500">💡 Mark ingredients as essential in your kitchen to enable auto-add</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* To Buy Section */}
            {unpurchasedItems.length > 0 && (
              <div className="bg-[#ebe6de] rounded-xl p-6 border-2 border-[#ded8c5]">
                <h2 className="text-xl font-bold text-gray-900 mb-4">To Buy ({unpurchasedItems.length})</h2>
                <div className="space-y-2">
                  {unpurchasedItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-4 bg-[#f0eae3] rounded-lg border border-[#ded8c5] hover:border-[#372f29] transition-all">
                      <button onClick={() => togglePurchased(item._id, item.isPurchased)} className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-[#372f29] hover:bg-[#372f29] transition-colors cursor-pointer" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <button onClick={() => deleteItem(item._id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Section */}
            {purchasedItems.length > 0 && (
              <div className="bg-[#ebe6de] rounded-xl p-6 border-2 border-[#ded8c5]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Purchased ({purchasedItems.length})</h2>
                  <Button onClick={clearPurchased} size="sm" variant="outline" className="cursor-pointer bg-red-50 border-red-300 text-red-700 hover:bg-red-100">
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2">
                  {purchasedItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-4 bg-[#ded8c5] rounded-lg opacity-60">
                      <button onClick={() => togglePurchased(item._id, item.isPurchased)} className="flex-shrink-0 w-6 h-6 rounded-full bg-[#372f29] flex items-center justify-center cursor-pointer">
                        <Check className="h-4 w-4 text-white" />
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700 line-through">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <button onClick={() => deleteItem(item._id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
