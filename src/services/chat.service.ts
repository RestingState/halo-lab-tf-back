import prisma from '../lib/prisma';

class ChatService {
  async createChat({ gameId }: { gameId: number }) {
    return prisma.chat.create({ data: { game: { connect: { id: gameId } } } });
  }

  async createMessage({
    text,
    chatId,
    userId,
  }: {
    text: string;
    chatId: number;
    userId: number;
  }) {
    return prisma.chatMessage.create({
      data: {
        text,
        chat: { connect: { id: chatId } },
        user: { connect: { id: userId } },
      },
    });
  }
}

export default new ChatService();
