import mongoose, { Schema, models } from "mongoose";

const RecipeSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  prepTime: String,
  cookTime: String,
  servings: Number,
  calories: Number,
  ingredients: [
    {
      name: String,
      amount: String,
      fromKitchen: Boolean,
    },
  ],
  instructions: [String],
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  cookedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recipe = models.Recipe || mongoose.model("Recipe", RecipeSchema);

export default Recipe;
