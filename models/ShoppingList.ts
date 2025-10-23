import mongoose, { Schema, models } from "mongoose";

const ShoppingListSchema = new Schema({
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
    default: "1",
  },
  unit: {
    type: String,
    default: "pieces",
  },
  category: {
    type: String,
    required: true,
  },
  isPurchased: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const ShoppingList = models.ShoppingList || mongoose.model("ShoppingList", ShoppingListSchema);

export default ShoppingList;
