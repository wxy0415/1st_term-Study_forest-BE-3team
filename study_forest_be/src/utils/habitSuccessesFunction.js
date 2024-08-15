async function habitSuccessesFunction(habitId, gte, lt) {
  return await prisma.habitSuccessed.findMany({
    where: {
      habitId,
      createdAt: {
        gte,
        lt,
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export default habitSuccessesFunction;
