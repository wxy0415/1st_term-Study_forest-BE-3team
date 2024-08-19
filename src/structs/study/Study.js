import * as s from "superstruct";

const CreateStudyBody = {
  nickname: s.size(s.string(), 2, 12),
  studyName: s.size(s.string(), 2, 20),
  description: s.optional(s.size(s.string(), 0, 100)),
};

export const CreateStudy = s.object({
  ...CreateStudyBody,
  background: s.size(s.string(), 0, 50),
  password: s.size(s.string(), 8, 24),
});

export const PatchStudy = s.partial(s.object({
  ...CreateStudyBody,
  point: s.min(s.integer(), 0)
}));

export const Password = s.object({
  password: s.size(s.string(), 8, 24),
});