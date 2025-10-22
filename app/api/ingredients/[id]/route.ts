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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ingredient ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, quantity, unit, category } = body;

    await connectDB();

    // Make sure the ingredient belongs to the user
    const ingredient = await Ingredient.findOne({ _id: id, userId });

    if (!ingredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    ingredient.name = name;
    ingredient.quantity = quantity;
    ingredient.unit = unit;
    ingredient.category = category;
    ingredient.lastUpdated = new Date();
    await ingredient.save();

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
