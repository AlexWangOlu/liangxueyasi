import { NextRequest, NextResponse } from "next/server";
import { deepSeek, GeneratedQuestion } from "@/lib/deepseek";
import { generateMockQuestion } from "@/lib/deepseek-mock";
import { z } from "zod";

const generateSchema = z.object({
  topic: z.string().min(1).max(100),
  type: z.enum(["Argumentative", "Discussion", "Opinion"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = generateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { topic, type } = result.data;

    if (!process.env.DEEPSEEK_API_KEY) {
      console.log("DeepSeek API Key not configured, using mock data");
      const mockQuestion: GeneratedQuestion = generateMockQuestion(topic, type);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({ success: true, data: mockQuestion }, { status: 200 });
    }

    const question: GeneratedQuestion = await deepSeek.generateQuestion(topic, type);

    return NextResponse.json({ success: true, data: question }, { status: 200 });
  } catch (error) {
    console.error("Generate question error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 }
    );
  }
}
