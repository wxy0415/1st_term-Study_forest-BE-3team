import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import express from "express";
import asyncHandler from "./utils/asyncErrorHandler";
import { assert } from "superstruct";
import { CreateStudy } from "./structs/study/CreateStudy";
import { PatchStudy } from "./structs/study/PatchStudy";
import { PatchHabit } from "./structs/habit/PatchHabit";
import { DeleteHabit } from "./structs/habit/DeleteHabit";
import weekdateHandler from "./utils/weekDateHandler";
import habitSuccessesFunction from "./utils/habitSuccessesFunction";
import successedBoolin from "./utils/successedBoolin";

dotenv.config;

const prisma = new PrismaClient();

const app = new express();
app.use(express.json());

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
    });

    res.send(studys);
  })
);

// 스터디 생성
app.post(
  "/study",
  asyncHandler(async (req, res) => {
    assert(req.body, CreateStudy);
    const study = await prisma.study.create({
      data: req.body,
    });

    res.status(201).send(study);
  })
);

// 스터디 상세 조회
app.get(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.findMany({
      where: { id },
    });
    res.send(study);
  })
);

// 스터디 정보 수정
app.patch(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, PatchStudy);

    const study = await prisma.study.update({
      where: { id },
      data: req.body,
    });

    res.send(study);
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
    });

    res.send(habit);
  })
);

//습관 삭제
app.patch(
  "/habit/:id/delete",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, DeleteHabit);

    const habit = await prisma.habit.update({
      where: { id },
      data: req.body,
    });

    res.send(habit);
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
