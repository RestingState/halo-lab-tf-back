import prisma from '../lib/prisma';

class UserService {
  async addUser(username: string) {
    return prisma.user.create({ data: { username } });
  }
}

export default new UserService();
