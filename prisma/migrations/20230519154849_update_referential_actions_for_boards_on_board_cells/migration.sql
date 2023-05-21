-- DropForeignKey
ALTER TABLE "BoardsOnBoardCells" DROP CONSTRAINT "BoardsOnBoardCells_boardCellId_fkey";

-- DropForeignKey
ALTER TABLE "BoardsOnBoardCells" DROP CONSTRAINT "BoardsOnBoardCells_boardId_fkey";

-- AddForeignKey
ALTER TABLE "BoardsOnBoardCells" ADD CONSTRAINT "BoardsOnBoardCells_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardsOnBoardCells" ADD CONSTRAINT "BoardsOnBoardCells_boardCellId_fkey" FOREIGN KEY ("boardCellId") REFERENCES "BoardCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
