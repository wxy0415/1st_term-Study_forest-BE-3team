import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config;
import express from "express";
import asyncHandler from "./src/utils/asyncErrorHandler.js";
import { assert } from "superstruct";
import { CreateStudy } from "./src/structs/study/CreateStudy.js";
import { PatchStudy } from "./src/structs/study/PatchStudy.js";
import { CreateHabit } from "./src/structs/habit/CreateHabit.js";
import { PatchHabit } from "./src/structs/habit/PatchHabit.js";

// import weekdateHandler from "./src/utils/weekDateHandler.js";
// import habitSuccessesFunction from "./src/utils/habitSuccessesFunction.js";
// import successedBoolin from "./src/utils/successedBoolin.js";

const prisma = new PrismaClient();

const app = new express();
app.use(express.json());

// 스터디 생성
app.post(
  "/study",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateStudy);
    const study = await prisma.study.create({
      data: req.body,
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    res.status(201).send(study);
  })
);

// 스터디 목록 조회
app.get(
  "/study",
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      pageSize = 6,
      order = "newest",
      keyWord = "",
    } = req.query;

    let orderBy;
    switch (order) {
      case "bigPoint":
        orderBy = { point: "desc" };
        break;
      case "smallPoint":
        orderBy = { point: "asc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    const skipInt = (page - 1) * pageSize;
    const studys = await prisma.study.findMany({
      orderBy,
      skip: parseInt(skipInt),
      take: parseInt(pageSize),
      where: {
        OR: [
          { studyName: { contains: keyWord } },
          { description: { contains: keyWord } },
        ],
      },
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    res.send(studys);
  })
);

// 스터디 상세 조회
app.get(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });
    res.send(study);
  })
);

// 상세 스터디 수정
app.patch(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchStudy);

    const study = await prisma.study.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        nickname: true,
        studyName: true,
        description: true,
        background: true,
        point: true,
        createdAt: true,
      },
    });

    res.send(study);
  })
);

// 습관 생성
app.post(
  "/study/:id/habit",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateHabit);
    const habit = await prisma.habit.create({
      data: req.body,
      select: {
        id: true,
        name: true,
        deleted: true,
        studyId: true,
        createdAt: true,
      },
    });

    res.status(201).send(habit);
  })
);

//습관 이름 수정
app.patch(
  "/habit/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchHabit);

    const habit = await prisma.habit.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        name: true,
        deleted: true,
        createdAt: true,
      },
    });

    res.send(habit);
  })
);

//습관 삭제
app.patch(
  "/habit/:id/delete",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const habit = await prisma.habit.update({
      where: { id },
      data: { deleted: false },
      select: { id: true },
    });

    res.send(habit);
  })
);

//습관 리스트 조회
app.get(
  "/study/:id/habitList",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const habits = await prisma.habit.findMany({
      where: {
        studyId: id,
        deleted: false,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        deleted: true,
        studyId: true,
        createdAt: true,
      },
    });

    res.send(habits);
  })
);

//완료한 습관 추가
app.post(
  "/habit/:id/success",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const success = await prisma.habitSuccessed.create({
      data: { habitId: id },
      select: {
        id: true,
        createdAt: true,
        habitId: true,
      },
    });

    res.status(201).send(success);
  })
);

//완료한 습관 삭제
app.delete(
  "/success/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const success = await prisma.habitSuccessed.delete({
      where: { id },
      select: {
        id: true,
        habitId: true,
      },
    });

    res.status(200).send(success);
  })
);

// 습관 조회
// app.get(
//   "/study/:id/habits",
//   asyncHandler(async (req, res) => {
//     const { studyId } = req.params;

//     const habitsData = await prisma.habit.findMany({
//       where: {
//         studyId,
//       },
//       orderBy: { createdAt: "asc" },
//     });

//     const habitTotal = habitsData.length;

//     //최근 일주일 날짜 구하는 함수
//     const { gte, lt } = weekdateHandler();

//     // 습관 id 배열 []
//     const habitIds = habitsData.map((Data) => {
//       return Data.id;
//     });

//     // 완료한 습관 호출
//     const habitPromise = habitIds.map((habitId) => {
//       habitSuccessesFunction(habitId, gte, lt);
//     });

//     //완료한 습관의 배열 [[{}, {}, ...], [{}, {}, ...], ...]
//     const result = await Promise.all(habitPromise);

//     const successed = successedBoolin(result);

//     const habits = [];
//     for (i = 0; i < habitsData.length; i++) {
//       habits.push({
//         ...habitsData[i],
//         success: successed[i],
//       });
//     }

//     res.send(habits);
//   })
// );

app.listen(process.env.PORT || 3000, () => console.log("Sever Started"));
