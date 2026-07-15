import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const topic = searchParams.get("topic") || "";
    const year = searchParams.get("year") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (topic) where.topic = topic;
    if (year) where.year = parseInt(year);
    if (search) {
      where.OR = [
        { en: { contains: search } },
        { zh: { contains: search } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.writingQuestion.findMany({
        where,
        include: { views: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: "desc" },
      }),
      prisma.writingQuestion.count({ where }),
    ]);

    return NextResponse.json({
      data: questions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: (error as Error).message }, { status: 500 });
  }
}
