import * as s from "superstruct";

//스터디 생성 유효성 검사
export const CreateStudy = s.object({
  nickName: s.size(s.string(), 2, 12),
  studyName: s.size(s.string(), 2, 20),
  description: s.size(s.string(), 0, 100),
  background: s.size(s.string, 0, 50),
  password: s.size(s.string(), 8, 24),
});

export const PatchStudy = s.partial(s.object({
  ...CreateStudy,
  point: s.min(s.integer(), 0)
}));
