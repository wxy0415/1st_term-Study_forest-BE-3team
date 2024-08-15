import * as s from "superstruct";
import { CreateStudy } from "./CreateStudy";

export const PatchStudy = s.partial(s.object({
  ...CreateStudy,
  point: s.min(s.integer(), 0)
}));
