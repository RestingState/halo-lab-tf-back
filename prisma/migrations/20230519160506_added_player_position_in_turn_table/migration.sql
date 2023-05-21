/*
  Warnings:

  - Added the required column `playerX` to the `Turn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerY` to the `Turn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Turn" ADD COLUMN     "playerX" INTEGER NOT NULL,
ADD COLUMN     "playerY" INTEGER NOT NULL;
