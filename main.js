import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config;
import cors from 'cors';
import express from 'express';
import moment from 'moment';
import { subDays } from 'date-fns';
import asyncHandler from './src/utils/asyncErrorHandler.js';
import { assert } from 'superstruct';
import { CreateStudy, PatchStudy, Password } from './src/structs/study/Study.js';
import { ValidationHabit } from './src/structs/habit/Habit.js';
import { todayUCT, nextDayUCT } from './src/utils/timeRangeHandler.js';

const prisma = new PrismaClient();

const app = new express();

app.use(cors());
app.use(express.json());

function throwUnauthorized() {
  const error = new Error('Unauthorized');
  error.status = 401;
  throw error;
}

const emojiFormat = { emoNum: true, count: true };

/** /study POST 스터디 생성 */
app.post(
  '/study',
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

/** /study GET 스터디 목록 조회 */
app.get(
  '/study',
  asyncHandler(async (req, res) => {
    const { page, pageSize, order = 'recent', keyWord = '' } = req.query;

    let orderBy;
    switch (order) {
      case 'mostPoint':
        orderBy = { point: 'desc' };
        break;
      case 'leastPoint':
        orderBy = { point: 'asc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 6;
    const skipInt = (pageNum - 1) * pageSizeNum;

    const studys = await prisma.study.findMany({
      orderBy,
      skip: parseInt(skipInt),
      take: parseInt(pageSizeNum),
      where: {
        OR: [{ studyName: { contains: keyWord } }, { description: { contains: keyWord } }],
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

/** /study/:id GET 스터디 상세 정보 */
app.get(
  '/study/:id',
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

/** /study/:id PATCH 스터디 상세 수정 */
app.patch(
  '/study/:id',
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

/** /study/:id DELETE 스터디 상세 삭제 */
app.delete(
  '/study/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.delete({
      where: { id },
    });

    res.sendStatus(204);
  })
);

/** /study/:id/auth POST 비밀번호 일치 확인 */
app.post(
  '/study/:id/auth',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, Password);

    const { password } = await prisma.study.findUniqueOrThrow({
      where: { id },
    });

    if (req.body.password !== password) {
      const result = { result: false };
      res.status(200).send(result);
      return;
    }

    const result = { result: true };
    res.status(200).send(result);
  })
);

/** /study/:id/habit POST 습관 생성 */
app.post(
  '/study/:id/habit',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, ValidationHabit);
    const habit = await prisma.habit.create({
      data: {
        ...req.body,
        studyId: id,
      },
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

/** /study/:id/habitList GET 습관 정보 리스트 조회 */
app.get(
  '/study/:id/habitList',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const habits = await prisma.habit.findMany({
      where: {
        studyId: id,
        deleted: false,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        deleted: true,
        studyId: true,
        createdAt: true,
        HabitSuccessDates: {
          where: {
            createdAt: {
              gte: todayUCT,
              // lt: nextDayUCT,
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    const totalCount = habits.length;

    const data = {
      totalCount,
      habits,
    };

    res.send(data);
  })
);

/** /study/:id/habitData GET 습관 정보 조회(최근 일주일 성공 날짜 정보 포함) */
app.get(
  '/study/:id/habitData',
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;
    const now = new Date();
    const DBNow = now.setHours(now.getHours() - 9);
    const oneWeekAgo = subDays(DBNow, 7);

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Habits: {
          include: {
            HabitSuccessDates: { where: { createdAt: { gte: oneWeekAgo } } },
          },
        },
      },
    });

    const habits = study.Habits.map((item) => {
      const { id, name, deleted, HabitSuccessDates } = item;
      const success = HabitSuccessDates.map((date) => {
        const successDay = moment(date.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSSZ');
        const diff = Math.floor(successDay.diff(DBNow) / (1000 * 60 * 60 * 24)) + 6;

        return diff;
      });

      return {
        id: id,
        name: name,
        deleted: deleted,
        success: success,
      };
    });

    const result = {
      id: studyId,
      totalHabit: habits.length,
      habits: habits,
    };

    res.status(200).send(result);
  })
);

/** /habit/:id PACH 습관 이름 수정 */
app.patch(
  '/habit/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    assert(req.body, ValidationHabit);

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

/** /habit/:id/delete PACH 습관 삭제 */
app.patch(
  '/habit/:id/delete',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const habit = await prisma.habit.update({
      where: { id },
      data: { deleted: true },
      select: { id: true },
    });

    res.send(habit);
  })
);

/** /habit/:id/success POST 완료한 습관 추가 */
app.post(
  '/habit/:id/success',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const success = await prisma.habitSuccessDate.create({
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

/** /success/:id DELETE 완료된 습관 취소 */
app.delete(
  '/success/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const success = await prisma.habitSuccessDate.delete({
      where: { id },
      select: {
        id: true,
        habitId: true,
      },
    });

    res.sendStatus(204);
  })
);

/** /study/:id/emoji GET 응원 이모지 조회 */
app.get(
  '/study/:id/emoji',
  asyncHandler(async (req, res) => {
    const { id: studyId } = req.params;

    const study = await prisma.study.findUniqueOrThrow({
      where: { id: studyId },
      include: {
        Emojis: { orderBy: { count: 'desc' }, select: emojiFormat },
      },
    });

    const totalCount = study.Emojis.length;

    const { Emojis } = study;

    const result = { totalCount: totalCount, Emojis: Emojis };
    res.status(200).send(result);
  })
);

/** /study/:id/emoji/:emojiNum  PUT 미정 응원 이모지 추가 */
app.put(
  '/study/:id/emoji/:emojiNum',
  asyncHandler(async (req, res) => {
    const { id: studyId, emojiNum } = req.params;
    const castedEmoNum = Number(emojiNum);
    const emoji = await prisma.emoji.findFirst({
      where: { studyId: studyId, emoNum: castedEmoNum },
    });

    if (!emoji) {
      const data = { emoNum: castedEmoNum, count: 1, studyId: studyId };
      const result = await prisma.emoji.create({
        data: data,
        select: emojiFormat,
      });
      res.status(201).send(result);
      return;
    } else {
      const data = { emoNum: castedEmoNum, count: Number(emoji.count) + 1 };
      const result = await prisma.emoji.update({
        where: { id: emoji.id },
        data: data,
        select: emojiFormat,
      });
      res.status(200).send(result);
      return;
    }
  })
);

app.listen(process.env.PORT || 3000, () => console.log('Sever Started'));
