/*
  Warnings:

  - You are about to drop the column `emoNum` on the `Emoji` table. All the data in the column will be lost.
  - Added the required column `emoji_code` to the `Emoji` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Emoji" DROP COLUMN "emoNum",
ADD COLUMN     "emoji_code" VARCHAR(49) NOT NULL;

-- AlterTable
ALTER TABLE "Study" ALTER COLUMN "background" SET DATA TYPE VARCHAR(100);
