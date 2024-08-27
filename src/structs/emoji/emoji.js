import * as s from "superstruct";

export const Emoji = s.object({
  emojiCode: s.size(s.string(), 1, 49),
});
