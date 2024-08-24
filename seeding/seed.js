import { PrismaClient } from "@prisma/client";
import { Studies, Emoji, Habits, HabitSuccessed } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.study.deleteMany();
  await prisma.emoji.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.habitSuccessDate.deleteMany();

  // 목 데이터 삽입
  await prisma.study.createMany({
    data: Studies,
    skipDuplicates: true,
  });
  await prisma.emoji.createMany({
    data: Emoji,
    skipDuplicates: true,
  });
  await prisma.habit.createMany({
    data: Habits,
    skipDuplicates: true,
  });
  await prisma.habitSuccessDate.createMany({
    data: HabitSuccessed,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
