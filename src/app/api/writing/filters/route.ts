import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [topics, years] = await Promise.all([
      prisma.writingQuestion.findMany({
        select: { topic: true },
        distinct: ["topic"],
        orderBy: { topic: "asc" },
      }),
      prisma.writingQuestion.findMany({
        select: { year: true },
        distinct: ["year"],
        orderBy: { year: "desc" },
      }),
    ]);

    return NextResponse.json({
      topics: topics.map((t) => t.topic),
      years: years.map((y) => y.year),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: (error as Error).message }, { status: 500 });
  }
}
