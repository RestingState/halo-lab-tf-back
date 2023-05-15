import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model == 'User' && params.action == 'create') {
    params.args.data.password = await bcrypt.hash(
      params.args.data.password,
      10
    );
  }

  return next(params);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
