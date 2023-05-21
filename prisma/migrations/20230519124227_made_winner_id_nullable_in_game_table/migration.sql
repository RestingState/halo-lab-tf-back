-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_winnerId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "winnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
