import { NextRequest, NextResponse } from "next/server";
import { analyzeKitchenImage } from "@/lib/analyzeImage";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const ingredients = await analyzeKitchenImage(image);

    return NextResponse.json({
      success: true,
      ingredients,
    });
  } catch (error) {
    console.error("Error in analyze-image API:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
