-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('pending', 'in_process', 'finished');

-- CreateEnum
CREATE TYPE "BoardCellValue" AS ENUM ('w', 'p');

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "boardId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamesOnUsers" (
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GamesOnUsers_pkey" PRIMARY KEY ("userId","gameId")
);

-- CreateTable
CREATE TABLE "BoardCell" (
    "id" SERIAL NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "value" "BoardCellValue" NOT NULL,

    CONSTRAINT "BoardCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "exitBoardCellId" INTEGER NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardsOnBoardCells" (
    "boardId" INTEGER NOT NULL,
    "boardCellId" INTEGER NOT NULL,

    CONSTRAINT "BoardsOnBoardCells_pkey" PRIMARY KEY ("boardId","boardCellId")
);

-- CreateTable
CREATE TABLE "GameCell" (
    "id" SERIAL NOT NULL,
    "boardCellId" INTEGER NOT NULL,
    "visible" BOOLEAN NOT NULL,

    CONSTRAINT "GameCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turn" (
    "id" SERIAL NOT NULL,
    "playerTurn" INTEGER NOT NULL,
    "gameTurn" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "playerCellId" INTEGER NOT NULL,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_gameId_key" ON "Chat"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamesOnUsers" ADD CONSTRAINT "GamesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamesOnUsers" ADD CONSTRAINT "GamesOnUsers_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_exitBoardCellId_fkey" FOREIGN KEY ("exitBoardCellId") REFERENCES "BoardCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardsOnBoardCells" ADD CONSTRAINT "BoardsOnBoardCells_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardsOnBoardCells" ADD CONSTRAINT "BoardsOnBoardCells_boardCellId_fkey" FOREIGN KEY ("boardCellId") REFERENCES "BoardCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCell" ADD CONSTRAINT "GameCell_boardCellId_fkey" FOREIGN KEY ("boardCellId") REFERENCES "BoardCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_playerCellId_fkey" FOREIGN KEY ("playerCellId") REFERENCES "GameCell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
