import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const word = await prisma.word.findUnique({
      where: { id: parseInt(id) },
      include: { vocabulary: true },
    });

    if (!word) {
      return NextResponse.json({ error: "单词不存在" }, { status: 404 });
    }

    return NextResponse.json({ data: word });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
