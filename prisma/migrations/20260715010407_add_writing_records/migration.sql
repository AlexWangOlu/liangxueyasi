-- CreateTable
CREATE TABLE "writing_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "question_en" TEXT NOT NULL,
    "question_zh" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "essay" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "task_achievement" REAL NOT NULL,
    "coherence_cohesion" REAL NOT NULL,
    "lexical_resource" REAL NOT NULL,
    "grammatical_range" REAL NOT NULL,
    "feedback" TEXT,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
