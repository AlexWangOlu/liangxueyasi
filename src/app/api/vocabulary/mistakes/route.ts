import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const [mistakes, total] = await Promise.all([
      prisma.wordMistake.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastWrongAt: "desc" },
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
      prisma.wordMistake.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: mistakes.map((m: typeof mistakes[0]) => ({
        ...m.word,
        mistakeCount: m.count,
        lastWrongAt: m.lastWrongAt,
        mistakeType: m.mistakeType,
        correctAnswer: m.correctAnswer,
        wrongAnswer: m.wrongAnswer,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get mistakes error:", error);
    return NextResponse.json(
      { error: "Failed to get mistakes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = z.object({
      wordId: z.number(),
      mistakeType: z.string(),
      correctAnswer: z.string(),
      wrongAnswer: z.string().optional(),
    }).safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { wordId, mistakeType, correctAnswer, wrongAnswer } = result.data;

    const existing = await prisma.wordMistake.findFirst({
      where: { wordId, mistakeType, userId: "anonymous" },
    });

    if (existing) {
      await prisma.wordMistake.update({
        where: { id: existing.id },
        data: {
          count: existing.count + 1,
          lastWrongAt: new Date(),
          correctAnswer,
          ...(wrongAnswer && { wrongAnswer }),
        },
      });
    } else {
      await prisma.wordMistake.create({
        data: {
          wordId,
          mistakeType,
          correctAnswer,
          wrongAnswer,
          userId: "anonymous",
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Add mistake error:", error);
    return NextResponse.json(
      { error: "Failed to add mistake" },
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

    await prisma.wordMistake.deleteMany({
      where: { wordId: result.data.wordId, userId: "anonymous" },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Remove mistake error:", error);
    return NextResponse.json(
      { error: "Failed to remove mistake" },
      { status: 500 }
    );
  }
}
