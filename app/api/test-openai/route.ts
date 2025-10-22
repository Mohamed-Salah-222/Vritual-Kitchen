import { NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function GET() {
  try {
    // Simple test to see if API key works
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Say 'OpenAI is connected!' if you can read this." }],
      max_tokens: 20,
    });

    const message = response.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      message: "OpenAI connected successfully!",
      testResponse: message,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        message: "OpenAI connection failed",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
