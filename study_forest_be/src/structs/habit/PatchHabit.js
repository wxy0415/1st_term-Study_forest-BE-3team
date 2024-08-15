import * as s from "superstruct";

export const PatchHabit = s.object({
  name: s.size(s.string(), 1, 30),
});
