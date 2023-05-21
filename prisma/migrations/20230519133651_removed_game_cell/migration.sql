/*
  Warnings:

  - You are about to drop the column `playerCellId` on the `Turn` table. All the data in the column will be lost.
  - You are about to drop the `GameCell` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameCell" DROP CONSTRAINT "GameCell_boardCellId_fkey";

-- DropForeignKey
ALTER TABLE "Turn" DROP CONSTRAINT "Turn_playerCellId_fkey";

-- AlterTable
ALTER TABLE "Turn" DROP COLUMN "playerCellId";

-- DropTable
DROP TABLE "GameCell";

-- CreateTable
CREATE TABLE "TurnsOnBoardCells" (
    "turnId" INTEGER NOT NULL,
    "boardCellId" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TurnsOnBoardCells_pkey" PRIMARY KEY ("turnId","boardCellId")
);

-- AddForeignKey
ALTER TABLE "TurnsOnBoardCells" ADD CONSTRAINT "TurnsOnBoardCells_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "Turn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnsOnBoardCells" ADD CONSTRAINT "TurnsOnBoardCells_boardCellId_fkey" FOREIGN KEY ("boardCellId") REFERENCES "BoardCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
