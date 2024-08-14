/*
  Warnings:

  - You are about to drop the column `passworg` on the `Study` table. All the data in the column will be lost.
  - Added the required column `password` to the `Study` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Study" DROP COLUMN "passworg",
ADD COLUMN     "password" TEXT NOT NULL;
