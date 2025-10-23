import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    await connectDB();

    // Get the old ingredient to check if it was above 0
    const oldIngredient = await Ingredient.findOne({ _id: id, userId });

    if (!oldIngredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    const oldQuantity = parseFloat(oldIngredient.quantity);
    const newQuantity = parseFloat(body.quantity);

    // Update the ingredient
    const ingredient = await Ingredient.findOneAndUpdate({ _id: id, userId }, { ...body, lastUpdated: new Date() }, { new: true });

    // Auto-add to shopping list if quantity dropped to 0 and it was essential
    if (oldQuantity > 0 && newQuantity === 0 && oldIngredient.isEssential) {
      const ShoppingList = (await import("@/models/ShoppingList")).default;

      // Check if already in shopping list
      const existingItem = await ShoppingList.findOne({
        userId,
        name: { $regex: new RegExp(`^${ingredient.name}$`, "i") },
        isPurchased: false,
      });

      if (!existingItem) {
        await ShoppingList.create({
          userId,
          name: ingredient.name,
          quantity: "1",
          unit: ingredient.unit,
          category: ingredient.category,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ingredient,
    });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ingredient ID" }, { status: 400 });
    }

    await connectDB();

    // Make sure the ingredient belongs to the user
    const ingredient = await Ingredient.findOneAndDelete({ _id: id, userId });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Ingredient deleted",
    });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
