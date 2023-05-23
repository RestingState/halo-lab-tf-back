import { ChatMessageType } from '@prisma/client';
import prisma from '../lib/prisma';

class ChatService {
  async createChat({ gameId }: { gameId: number }) {
    return prisma.chat.create({ data: { game: { connect: { id: gameId } } } });
  }

  async createMessage({
    text,
    gameId,
    userId,
    type,
  }: {
    text: string;
    gameId: number;
    userId: number;
    type: ChatMessageType;
  }) {
    return prisma.chatMessage.create({
      data: {
        text,
        chat: { connect: { gameId } },
        user: { connect: { id: userId } },
        type,
      },
      select: {
        id: true,
        text: true,
        user: { select: { id: true, username: true } },
        type: true,
        createdAt: true,
      },
    });
  }
}

export default new ChatService();
