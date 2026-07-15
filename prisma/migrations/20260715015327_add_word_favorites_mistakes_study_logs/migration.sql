-- CreateTable
CREATE TABLE "word_favorites" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "word_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_favorites_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "word_mistakes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "word_id" INTEGER NOT NULL,
    "mistake_type" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "wrong_answer" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_wrong_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_mistakes_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "word_study_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL DEFAULT 'anonymous',
    "word_id" INTEGER NOT NULL,
    "study_mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "word_study_logs_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "word_favorites_userId_word_id_key" ON "word_favorites"("userId", "word_id");

-- CreateIndex
CREATE UNIQUE INDEX "word_mistakes_userId_word_id_mistake_type_key" ON "word_mistakes"("userId", "word_id", "mistake_type");
