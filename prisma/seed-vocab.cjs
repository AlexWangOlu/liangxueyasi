const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("开始导入词汇数据...");

  const files = [
    { id: "IELTS_2", name: "IELTS 词汇 2", path: "../IELTS_2.json" },
    { id: "IELTS_3", name: "IELTS 词汇 3", path: "../IELTS_3.json" },
  ];

  for (const file of files) {
    console.log(`\n处理 ${file.name}...`);

    const rawData = fs.readFileSync(path.join(__dirname, file.path), "utf-8");
    const data = JSON.parse(rawData);

    let vocab = await prisma.vocabulary.findUnique({ where: { bookId: file.id } });
    if (!vocab) {
      vocab = await prisma.vocabulary.create({
        data: { bookId: file.id, name: file.name },
      });
      console.log(`创建词汇表: ${file.name}`);
    }

    let imported = 0;
    for (const item of data) {
      const wordData = item.content.word;
      const content = wordData.content;

      try {
        await prisma.word.upsert({
          where: { wordId: wordData.wordId },
          update: {},
          create: {
            wordId: wordData.wordId,
            wordRank: item.wordRank,
            headWord: wordData.wordHead,
            ukPhone: content.ukphone || content.ukphone || null,
            usPhone: content.usphone || content.usspeech ? null : null,
            phone: content.phone || null,
            sentences: content.sentence?.sentences ? JSON.stringify(content.sentence.sentences) : null,
            phrases: content.phrase?.phrases ? JSON.stringify(content.phrase.phrases) : null,
            synonyms: content.syno?.synos ? JSON.stringify(content.syno.synos) : null,
            antonyms: content.antos?.anto ? JSON.stringify(content.antos.anto) : null,
            remMethod: content.remMethod?.val || null,
            related: content.relWord?.rels ? JSON.stringify(content.relWord.rels) : null,
            translations: content.trans ? JSON.stringify(content.trans) : null,
            vocabularyId: vocab.id,
          },
        });
        imported++;
        if (imported % 50 === 0) {
          console.log(`已导入 ${imported}/${data.length}`);
        }
      } catch (e) {
        console.warn(`跳过重复词: ${wordData.wordHead}`);
      }
    }

    console.log(`${file.name} 导入完成！共 ${imported} 个单词`);
  }

  const totalWords = await prisma.word.count();
  const totalVocabs = await prisma.vocabulary.count();
  console.log(`\n数据库统计：${totalVocabs} 个词汇表，${totalWords} 个单词`);

  await prisma.$disconnect();
}

main();