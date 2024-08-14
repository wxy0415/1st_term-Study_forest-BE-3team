import { PrismaClient, Prisma } from "@prisma/client";
import * as dotenv from "dotenv";
import express from "express";
import { CreateStudy, PatchStudy } from "./structs";
import { assert } from "superstruct";

dotenv.config;

const prisma = new PrismaClient();

const app = new express();
app.use(express.json());

//오류 처리 함수
function asyncHandler(asyncFunc) {
  return async function (req, res) {
    try {
      await asyncFunc(req, res);
    } catch (e) {
      if (
        e.name === "StructError" ||
        e instanceof Prisma.PrismaClientValidationError
      ) {
        res.status(400).send({ message: e.message });
      } else if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        res.sendStatus(404);
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };
}

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

//스터디 상세 조회
app.get(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const study = await prisma.study.findMany({
      where: { id },
      select: {
        nickName: true,
        studyName: true,
        description: true,
        point: true,
        createdAt: true,
        updatesdAt: true,
      },
    });
    res.send(study);
  })
);

//스터디 정보 수정

app.patch(
  "/study/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
  })
);
