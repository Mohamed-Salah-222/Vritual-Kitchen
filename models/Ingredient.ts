import mongoose, { Schema, models } from "mongoose";

const IngredientSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
    enum: ["grams", "kg", "pieces", "cups", "tbsp", "tsp", "ml", "liters", "oz", "lbs"],
  },
  category: {
    type: String,
    required: true,
    enum: ["protein", "carbs", "vegetables", "fruits", "dairy", "spices", "oils", "sweets", "other"],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Ingredient = models.Ingredient || mongoose.model("Ingredient", IngredientSchema);

export default Ingredient;
