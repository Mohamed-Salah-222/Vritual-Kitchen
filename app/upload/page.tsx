"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Edit2, Trash2, Plus, Save, Image as ImageIcon, Sparkles, Receipt, Camera } from "lucide-react";

import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression";

interface AnalyzedIngredient {
  name: string;
  quantity: string;
  unit: string;
  category: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"kitchen" | "receipt">("kitchen");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[]>([]);
  const [error, setError] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Drag & drop handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Compress images before adding
    const compressedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          return new File([compressedFile], file.name, { type: file.type });
        } catch (error) {
          console.error("Compression error:", error);
          return file;
        }
      })
    );

    setImages((prev) => [...prev, ...compressedFiles]);

    const newPreviewUrls = compressedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    toast.success(`${acceptedFiles.length} image(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setAnalyzing(true);
    setError("");
    const allIngredients: AnalyzedIngredient[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setUploadProgress({ ...uploadProgress, [i]: 50 });

        const base64 = await convertToBase64(image);

        const endpoint = mode === "receipt" ? "/api/analyze-receipt" : "/api/analyze-image";

        const response = await fetch(endpoint, {
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

        setUploadProgress({ ...uploadProgress, [i]: 100 });
        allIngredients.push(...data.ingredients);
      }

      if (allIngredients.length === 0) {
        toast.error("No ingredients detected in the images");
        return;
      }

      setAnalyzedIngredients(allIngredients);
      toast.success(`${allIngredients.length} ingredients detected!`);
    } catch (err) {
      console.error("Full error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze images";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAnalyzing(false);
      setUploadProgress({});
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
    toast.success("Ingredient removed");
  };

  const addManualIngredient = () => {
    setAnalyzedIngredients((prev) => [...prev, { name: "", quantity: "", unit: "grams", category: "other" }]);
    setEditingIndex(analyzedIngredients.length);
  };

  const toggleSelectItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(analyzedIngredients.map((_, i) => i)));
    }
    setSelectAll(!selectAll);
  };

  const deleteSelected = () => {
    if (selectedItems.size === 0) {
      toast.error("No items selected");
      return;
    }

    setAnalyzedIngredients((prev) => prev.filter((_, i) => !selectedItems.has(i)));
    setSelectedItems(new Set());
    setSelectAll(false);
    toast.success(`${selectedItems.size} items removed`);
  };

  const saveToDatabase = async () => {
    if (analyzedIngredients.length === 0) {
      toast.error("No ingredients to save");
      return;
    }

    const hasEmptyFields = analyzedIngredients.some((ing) => !ing.name || !ing.quantity || !ing.unit || !ing.category);

    if (hasEmptyFields) {
      toast.error("Please fill in all ingredient fields");
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

      // Show success animation
      toast.success("Ingredients saved to kitchen!");
      router.push("/kitchen");
    } catch (err) {
      console.error("Save error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to save ingredients";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const generateRecipesShortcut = () => {
    router.push("/recipes");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd] py-12 px-4">
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#372f29] to-[#211b16] rounded-2xl mb-4 shadow-lg">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Upload Your Kitchen</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Take photos of your ingredients and let AI identify everything for you</p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => {
                setMode("kitchen");
                previewUrls.forEach((url) => URL.revokeObjectURL(url));
                setImages([]);
                setPreviewUrls([]);
                setAnalyzedIngredients([]);
              }}
              variant={mode === "kitchen" ? "default" : "outline"}
              className={`cursor-pointer ${mode === "kitchen" ? "bg-[#372f29] text-white hover:bg-[#211b16]" : "bg-[#ebe6de] border-[#ded8c5] hover:bg-[#ded8c5]"}`}
            >
              <Camera className="h-4 w-4 mr-2" />
              Kitchen Photos
            </Button>
            <Button
              onClick={() => {
                setMode("receipt");
                previewUrls.forEach((url) => URL.revokeObjectURL(url));
                setImages([]);
                setPreviewUrls([]);
                setAnalyzedIngredients([]);
              }}
              variant={mode === "receipt" ? "default" : "outline"}
              className={`cursor-pointer ${mode === "receipt" ? "bg-[#372f29] text-white hover:bg-[#211b16]" : "bg-[#ebe6de] border-[#ded8c5] hover:bg-[#ded8c5]"}`}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Receipt Scanner
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[#ebe6de] rounded-2xl shadow-xl p-8 mb-8 border border-[#ded8c5]">
          <div {...getRootProps()} className={`border-3 border-dashed rounded-xl p-12 text-center transition-colors ${isDragActive ? "border-[#372f29] bg-[#ded8c5]" : "border-[#ded8c5] bg-[#f0eae3] hover:bg-[#ece7e0]"}`}>
            <input {...getInputProps()} />
            <div className="flex justify-center mb-4">
              <div className="bg-[#ded8c5] p-4 rounded-full">{mode === "receipt" ? <Receipt className="h-12 w-12 text-[#372f29]" /> : <ImageIcon className="h-12 w-12 text-[#372f29]" />}</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{isDragActive ? "Drop your images here" : "Drag & drop or click to browse"}</h3>
            <p className="text-gray-600 mb-6">{mode === "receipt" ? "Upload your grocery receipt for instant ingredient extraction" : "Upload photos of your kitchen, pantry, or fridge"}</p>
            <p className="text-sm text-gray-500 mt-4">Supports: JPG, PNG, WEBP • Multiple images • Auto-compressed</p>
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
                    toast.success("All images cleared");
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
                    {/* Progress Bar */}
                    {uploadProgress[index] !== undefined && (
                      <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#372f29] h-full transition-all duration-300" style={{ width: `${uploadProgress[index]}%` }} />
                      </div>
                    )}
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
                    Analyzing {mode === "receipt" ? "Receipt" : "Images"}...
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
                <X className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-700 font-medium">{error}</p>
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

            {/* Bulk Actions */}
            {analyzedIngredients.length > 1 && (
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#f0eae3] rounded-lg">
                <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 cursor-pointer" />
                <span className="text-sm font-medium text-gray-700">Select All ({selectedItems.size} selected)</span>
                {selectedItems.size > 0 && (
                  <Button onClick={deleteSelected} size="sm" variant="outline" className="ml-auto bg-red-500 border-red-500 text-white hover:bg-red-600 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
            )}

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
                      {analyzedIngredients.length > 1 && <input type="checkbox" checked={selectedItems.has(index)} onChange={() => toggleSelectItem(index)} className="w-4 h-4 mr-3 cursor-pointer" />}
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

            <div className="text-center pt-4 border-t space-y-3">
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

              <div>
                <Button onClick={generateRecipesShortcut} variant="outline" className="bg-[#ebe6de] border-[#ded8c5] hover:bg-[#ded8c5] cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Recipes with These
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-3">These ingredients will be added to your virtual kitchen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
