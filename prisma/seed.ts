import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.upsert({
    where: { slug: "sample-neck-fan" },
    update: {},
    create: {
      slug: "sample-neck-fan",
      title: "Bladeless Neck Fan",
      summary: "Placeholder review — replace with the first real product.",
      body: "This is seed content standing in for a real review: buy one unit, take photos, write up whether it's actually worth the money, and publish it here.",
      rating: 4,
      price: 24.99,
      published: true,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
