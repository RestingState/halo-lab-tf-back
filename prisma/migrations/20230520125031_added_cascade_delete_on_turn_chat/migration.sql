-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Turn" DROP CONSTRAINT "Turn_gameId_fkey";

-- DropForeignKey
ALTER TABLE "TurnsOnBoardCells" DROP CONSTRAINT "TurnsOnBoardCells_turnId_fkey";

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TurnsOnBoardCells" ADD CONSTRAINT "TurnsOnBoardCells_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "Turn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
