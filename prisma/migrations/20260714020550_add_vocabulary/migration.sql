-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" TEXT NOT NULL,
    "wordRank" INTEGER NOT NULL,
    "headWord" TEXT NOT NULL,
    "uk_phone" TEXT,
    "us_phone" TEXT,
    "phone" TEXT,
    "sentences" JSONB,
    "phrases" JSONB,
    "synonyms" JSONB,
    "antonyms" JSONB,
    "rem_method" TEXT,
    "related" JSONB,
    "translations" JSONB,
    "vocabulary_id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Word_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "Vocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_bookId_key" ON "Vocabulary"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_wordId_key" ON "Word"("wordId");
