import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const [totalStudied, totalFavorites, totalMistakes, recentActivity, studyStats] = await Promise.all([
      prisma.wordStudyLog.count(),
      prisma.wordFavorite.count({ where: { userId: "anonymous" } }),
      prisma.wordMistake.count({ where: { userId: "anonymous" } }),
      prisma.wordStudyLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { word: { select: { headWord: true } } },
      }),
      prisma.wordStudyLog.groupBy({
        by: ["studyMode", "status"],
        _count: { id: true },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStudied = await prisma.wordStudyLog.count({
      where: { createdAt: { gte: today }, userId: "anonymous" },
    });

    const modeStats: Record<string, { correct: number; wrong: number; total: number }> = {};
    studyStats.forEach((stat) => {
      const mode = stat.studyMode;
      if (!modeStats[mode]) {
        modeStats[mode] = { correct: 0, wrong: 0, total: 0 };
      }
      modeStats[mode].total += stat._count.id;
      if (stat.status === "correct") {
        modeStats[mode].correct += stat._count.id;
      } else if (stat.status === "wrong") {
        modeStats[mode].wrong += stat._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudied,
        todayStudied,
        totalFavorites,
        totalMistakes,
        recentActivity: recentActivity.map((log: typeof recentActivity[0]) => ({
          word: log.word.headWord,
          mode: log.studyMode,
          status: log.status,
          time: log.createdAt,
        })),
        modeStats,
      },
    });
  } catch (error) {
    console.error("Get study summary error:", error);
    return NextResponse.json(
      { error: "Failed to get study summary" },
      { status: 500 }
    );
  }
}
