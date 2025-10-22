import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Ingredient from "@/models/Ingredient";

export async function GET() {
  try {
    // Connect to database
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("Connected successfully!");

    // Actually try to perform a database operation
    const count = await Ingredient.countDocuments();
    console.log("Document count:", count);

    // Try to create a test document
    const testIngredient = new Ingredient({
      userId: "test-user",
      name: "Test Item",
      quantity: "100",
      unit: "grams",
      category: "other",
    });

    // Validate it (doesn't save, just checks if structure is valid)
    await testIngredient.validate();
    console.log("Model validation passed!");

    return NextResponse.json({
      success: true,
      message: "Database connected and working!",
      ingredientsCount: count,
      connectionState: "Connected",
      databaseName: testIngredient.db?.name || "unknown",
    });
  } catch (error) {
    console.error("Database error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
