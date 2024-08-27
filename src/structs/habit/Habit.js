import * as s from "superstruct";
import { listTimeZones } from "timezone-support";

export const ValidationHabit = s.object({
  name: s.size(s.string(), 1, 30),
});

const validTimeZones = new Set(listTimeZones());

export const ValidateTimeZone = s.refine(s.string(), "TimeZone", (value) => {
  return validTimeZones.has(value);
});
