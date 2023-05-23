-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('command', 'message');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'message';
