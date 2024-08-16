import * as s from "superstruct";
import { CreateStudyBody } from "./CreateStudy.js";

export const PatchStudy = s.partial(s.object({
  ...CreateStudyBody,
  point: s.min(s.integer(), 0)
}));
