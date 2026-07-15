const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"));
const prisma = new PrismaClient();

async function main() {
  console.log(`开始导入 ${data.length} 道写作真题...`);

  let imported = 0;
  for (const item of data) {
    await prisma.writingQuestion.create({
      data: {
        year: item.year,
        date: item.date,
        variant: item.variant || null,
        en: item.en,
        zh: item.zh,
        topic: item.topic,
        views: {
          create: item.views.map((v) => ({
            side: v.side,
            claimZh: v.claim_zh || null,
            claimEn: v.claim_en || null,
            analysisZh: v.analysis_zh || null,
            analysisEn: v.analysis_en || null,
          })),
        },
      },
    });

    imported++;
    if (imported % 50 === 0) {
      console.log(`已导入 ${imported}/${data.length}`);
    }
  }

  console.log(`导入完成！共 ${imported} 道题`);

  const totalViews = await prisma.writingView.count();
  const totalQuestions = await prisma.writingQuestion.count();
  console.log(`数据库统计：${totalQuestions} 道题目，${totalViews} 个观点`);
}

main()
  .catch((e) => {
    console.error("导入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
