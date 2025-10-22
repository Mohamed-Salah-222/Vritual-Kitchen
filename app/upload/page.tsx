"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Edit2, Trash2, Plus, Save, Image as ImageIcon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalyzedIngredient {
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[]>([]);
  const [error, setError] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    setAnalyzing(true);
    setError("");
    const allIngredients: AnalyzedIngredient[] = [];

    try {
      for (const image of images) {
        const base64 = await convertToBase64(image);

        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to analyze image");
        }

        allIngredients.push(...data.ingredients);
      }

      // Check if any ingredients were found
      if (allIngredients.length === 0) {
        setError("No food or ingredients detected in the images. Please upload images that clearly show your ingredients.");
        return;
      }

      setAnalyzedIngredients(allIngredients);
    } catch (err) {
      console.error("Full error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze images");
    } finally {
      setAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const updateIngredient = (index: number, field: keyof AnalyzedIngredient, value: string) => {
    setAnalyzedIngredients((prev) => prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient)));
  };

  const deleteIngredient = (index: number) => {
    setAnalyzedIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addManualIngredient = () => {
    setAnalyzedIngredients((prev) => [...prev, { name: "", quantity: "", unit: "grams", category: "other" }]);
    setEditingIndex(analyzedIngredients.length);
  };

  const saveToDatabase = async () => {
    if (analyzedIngredients.length === 0) {
      setError("No ingredients to save");
      return;
    }

    const hasEmptyFields = analyzedIngredients.some((ing) => !ing.name || !ing.quantity || !ing.unit || !ing.category);

    if (hasEmptyFields) {
      setError("Please fill in all ingredient fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: analyzedIngredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save ingredients");
      }

      router.push("/kitchen");
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save ingredients");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Upload Your Kitchen</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Take photos of your ingredients and let AI identify everything for you</p>
        </div>

        {/* Upload Section */}
        <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-8 mb-8 border border-[#ded8c5]">
          <div className="border-3 border-dashed border-[#ded8c5] rounded-xl p-12 text-center bg-[#f0eae3] hover:bg-[#ece7e0] transition-colors">
            <div className="flex justify-center mb-4">
              <div className="bg-[#ded8c5] p-4 rounded-full">
                <ImageIcon className="h-12 w-12 text-[#372f29]" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your images here</h3>
            <p className="text-gray-600 mb-6">or click to browse from your device</p>
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" id="image-upload" />
            <label htmlFor="image-upload">
              <Button asChild size="lg" className="cursor-pointer bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] text-white">
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  Select Images
                </span>
              </Button>
            </label>
            <p className="text-sm text-gray-500 mt-4">Supports: JPG, PNG, WEBP • Multiple images allowed</p>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Selected Images ({images.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    setImages([]);
                    setPreviewUrls([]);
                  }}
                  className="bg-[#372f29] border-[#372f29] text-white hover:bg-[#211b16] hover:text-white cursor-pointer"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-40 object-cover rounded-lg border-2 border-[#ded8c5] group-hover:border-[#372f29] transition-colors" />
                    <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg transform hover:scale-110">
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {images.length > 0 && !analyzedIngredients.length && (
            <div className="mt-8 text-center">
              <Button onClick={analyzeImages} disabled={analyzing} size="lg" className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all text-white">
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Images...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze with AI
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-3">This may take a few seconds per image</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <p className="ml-3 text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {analyzedIngredients.length > 0 && (
          <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-8 border border-[#ded8c5]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Detected Ingredients</h2>
                <p className="text-gray-600">Review and edit before saving to your kitchen</p>
              </div>
              <Button onClick={addManualIngredient} variant="outline" size="sm" className="bg-[#372f29] border-[#372f29] text-white hover:bg-[#211b16] hover:text-white cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </div>

            <div className="space-y-3 mb-8">
              {analyzedIngredients.map((ingredient, index) => (
                <div key={index} className="p-5 bg-gradient-to-r from-[#f0eae3] to-[#ece7e0] rounded-xl border border-[#ded8c5] hover:border-[#372f29] transition-all">
                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <Input placeholder="Ingredient name" value={ingredient.name} onChange={(e) => updateIngredient(index, "name", e.target.value)} className="font-medium" />
                      <div className="grid grid-cols-3 gap-3">
                        <Input placeholder="Quantity" value={ingredient.quantity} onChange={(e) => updateIngredient(index, "quantity", e.target.value)} />
                        <select value={ingredient.unit} onChange={(e) => updateIngredient(index, "unit", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                        <select value={ingredient.category} onChange={(e) => updateIngredient(index, "category", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                      <Button onClick={() => setEditingIndex(null)} size="sm" className="bg-green-600 hover:bg-green-700 cursor-pointer">
                        Done Editing
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-gray-900 mb-1">{ingredient.name}</p>
                        <p className="text-sm font-semibold text-[#372f29]">
                          {ingredient.quantity} {ingredient.unit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => setEditingIndex(index)} size="sm" variant="ghost" className="hover:bg-[#ded8c5] cursor-pointer">
                          <Edit2 className="h-4 w-4 text-[#372f29]" />
                        </Button>
                        <Button onClick={() => deleteIngredient(index)} size="sm" variant="ghost" className="hover:bg-[#f0eae3] cursor-pointer">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center pt-4 border-t">
              <Button onClick={saveToDatabase} disabled={saving} size="lg" className="bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] cursor-pointer shadow-lg hover:shadow-xl transition-all px-12 text-white">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving to Kitchen...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save to My Kitchen ({analyzedIngredients.length} items)
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-3">These ingredients will be added to your virtual kitchen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
