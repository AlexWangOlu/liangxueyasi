import { NextRequest, NextResponse } from "next/server";
import { deepSeek, WritingResult } from "@/lib/deepseek";
import { generateMockGrade } from "@/lib/deepseek-mock";
import { z } from "zod";

const gradeSchema = z.object({
  question: z.string().min(10),
  essay: z.string().min(50).max(3000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = gradeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const { question, essay } = result.data;

    if (!process.env.DEEPSEEK_API_KEY) {
      console.log("DeepSeek API Key not configured, using mock data");
      const mockResult: WritingResult = generateMockGrade(essay);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json({ success: true, data: mockResult }, { status: 200 });
    }

    const writingResult: WritingResult = await deepSeek.gradeEssay(question, essay);

    return NextResponse.json({ success: true, data: writingResult }, { status: 200 });
  } catch (error) {
    console.error("Grade essay error:", error);
    return NextResponse.json(
      { error: "Failed to grade essay" },
      { status: 500 }
    );
  }
}
