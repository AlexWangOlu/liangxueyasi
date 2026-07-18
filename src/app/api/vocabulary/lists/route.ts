import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lists = await prisma.vocabulary.findMany({
      include: { _count: { select: { words: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      data: lists.map((l: typeof lists[0]) => ({
        id: l.id,
        bookId: l.bookId,
        name: l.name,
        wordCount: l._count.words,
      })),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
