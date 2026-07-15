-- CreateTable
CREATE TABLE "WritingQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "variant" TEXT,
    "en" TEXT NOT NULL,
    "zh" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "writing_views" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "side" TEXT NOT NULL,
    "claim_zh" TEXT,
    "claim_en" TEXT,
    "analysis_zh" TEXT,
    "analysis_en" TEXT,
    "question_id" INTEGER NOT NULL,
    CONSTRAINT "writing_views_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "WritingQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
