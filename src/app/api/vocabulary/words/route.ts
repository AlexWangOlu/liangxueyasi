import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const listId = searchParams.get("listId") || "";
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (listId) where.vocabularyId = parseInt(listId);
    if (search) {
      where.headWord = { contains: search, mode: "insensitive" };
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        select: {
          id: true,
          wordId: true,
          wordRank: true,
          headWord: true,
          ukPhone: true,
          usPhone: true,
          phone: true,
          translations: true,
          sentences: true,
          phrases: true,
          synonyms: true,
          antonyms: true,
          related: true,
          remMethod: true,
          vocabularyId: true,
          vocabulary: { select: { name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { wordRank: "asc" },
      }),
      prisma.word.count({ where }),
    ]);

    return NextResponse.json({
      data: words,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
