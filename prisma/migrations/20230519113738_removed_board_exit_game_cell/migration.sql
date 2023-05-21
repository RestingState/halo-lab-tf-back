/*
  Warnings:

  - You are about to drop the column `exitBoardCellId` on the `Board` table. All the data in the column will be lost.
  - Added the required column `exitX` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exitY` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_exitBoardCellId_fkey";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "exitBoardCellId",
ADD COLUMN     "exitX" INTEGER NOT NULL,
ADD COLUMN     "exitY" INTEGER NOT NULL;
