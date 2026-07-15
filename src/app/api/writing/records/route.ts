import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createRecordSchema = z.object({
  questionEn: z.string(),
  questionZh: z.string(),
  topic: z.string(),
  essay: z.string(),
  score: z.number(),
  taskAchievement: z.number(),
  coherenceCohesion: z.number(),
  lexicalResource: z.number(),
  grammaticalRange: z.number(),
  feedback: z.string().optional(),
  duration: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createRecordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.issues },
        { status: 400 }
      );
    }

    const record = await prisma.writingRecord.create({
      data: result.data,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("Create writing record error:", error);
    return NextResponse.json(
      { error: "Failed to create writing record" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const [records, total] = await Promise.all([
      prisma.writingRecord.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.writingRecord.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get writing records error:", error);
    return NextResponse.json(
      { error: "Failed to get writing records" },
      { status: 500 }
    );
  }
}
