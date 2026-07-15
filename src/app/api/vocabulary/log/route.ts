import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { wordId, studyMode, status } = await request.json();
    
    await prisma.wordStudyLog.create({
      data: {
        userId: "anonymous",
        wordId,
        studyMode,
        status,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create study log error:", error);
    return NextResponse.json(
      { error: "Failed to create study log" },
      { status: 500 }
    );
  }
}