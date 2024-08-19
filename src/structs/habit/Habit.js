import * as s from "superstruct";

export const ValidationHabit = s.object({
  name: s.size(s.string(), 1, 30),
});