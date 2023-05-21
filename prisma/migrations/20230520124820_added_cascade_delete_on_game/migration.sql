-- DropForeignKey
ALTER TABLE "GamesOnUsers" DROP CONSTRAINT "GamesOnUsers_gameId_fkey";

-- AddForeignKey
ALTER TABLE "GamesOnUsers" ADD CONSTRAINT "GamesOnUsers_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
