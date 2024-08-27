import * as s from "superstruct";

export const ValidateEmojiCode = s.object({
  emojiCode: s.size(s.string(), 1, 49),
});
