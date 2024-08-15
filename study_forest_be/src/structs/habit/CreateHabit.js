import * as s from "superstruct";

export const CreateHabit = s.object({
  name: s.size(s.string(), 1, 30),
  studyId: s.string(),
});
