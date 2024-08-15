import *as s from 'superstruct'

export const CreateStudy = s.object({
    nickName: s.size(s.string(), 2, 12),
    studyName: s.size(s.string(), 2, 20),
    description: s.size(s.string(), 0, 100),
    background: s.size(s.string(), 0, 50),
    password: s.size(s.string(), 8, 24),
  });