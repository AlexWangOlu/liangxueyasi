import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const [favorites, total] = await Promise.all([
      prisma.wordFavorite.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          word: {
            select: {
              id: true,
              wordId: true,
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
            },
          },
        },
      }),
      prisma.wordFavorite.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: favorites.map((f) => f.word),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = z.object({ wordId: z.number() }).safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { wordId } = result.data;

    const existing = await prisma.wordFavorite.findFirst({
      where: { wordId, userId: "anonymous" },
    });

    if (existing) {
      await prisma.wordFavorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { favorited: false } }, { status: 200 });
    }

    await prisma.wordFavorite.create({
      data: { wordId, userId: "anonymous" },
    });

    return NextResponse.json({ success: true, data: { favorited: true } }, { status: 201 });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const result = z.object({ wordId: z.number() }).safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    await prisma.wordFavorite.deleteMany({
      where: { wordId: result.data.wordId, userId: "anonymous" },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
