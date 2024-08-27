import { Prisma } from "@prisma/client";

// 오류 처리 함수
function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.status === 401) {
        res.status(401).send({ message: "Unauthorized" });
      } else if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // 유니크 키 제약 위반
        if (e.code === "P2002") {
          res.status(409).send({
            message: "Unique constraint failed on the field: " + e.meta.target,
          });
        } else if (e.code === "P2025") {
          res.status(404).send({ message: "Not Found" });
        } else {
          res.status(400).send({ message: e.message });
        }
        
      } else if (
        e instanceof Prisma.PrismaClientValidationError ||
        e.name === "StructError"
      ) {
        res.status(400).send({ message: "Validation error: " + e.message });
      
      } else if (e instanceof Prisma.PrismaClientRustPanicError) {
        res
          .status(500)
          .send({ message: "Internal server error: " + e.message });
      } else if (e instanceof Prisma.PrismaClientUnknownRequestError) {
        res
          .status(500)
          .send({ message: "Unknown request error: " + e.message });
      } else if (e instanceof Prisma.PrismaClientInitializationError) {
        res.status(500).send({ message: "Initialization error: " + e.message });
      
      } else {
        // 기타 예외 처리
        res.status(500).send({ message: e.message });
      }
    }
  };
}


export default asyncHandler;
