import prisma from '../lib/prisma';

class UserService {
  async userWithIdExists(userId: number) {
    return Boolean(
      await prisma.user.findFirst({
        where: { id: userId },
        select: { id: true },
      })
    );
  }
}

export default new UserService();
