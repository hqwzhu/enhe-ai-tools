const { PrismaClient } = require("@prisma/client");
const topicSeeds = require("./seed-ai-news-topics-data.cjs");

const prisma = new PrismaClient();

async function main() {
  let created = 0;

  for (const topic of topicSeeds) {
    const existing = await prisma.newsTopic.findUnique({
      where: { slug: topic.slug },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.newsTopic.create({
      data: {
        ...topic,
        status: "active",
      },
    });
    created += 1;
  }

  console.log(`AI news topic seed completed: ${created} created, ${topicSeeds.length - created} existing`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
