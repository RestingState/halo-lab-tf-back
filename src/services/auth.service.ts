import { User } from '@prisma/client';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthService {
  async singup({ username, password }: { username: string; password: string }) {
    const user = await prisma.user.create({
      data: { username, password },
    });

    const token = generateJwtToken(user);

    return { user, token };
  }

  async login(user: User) {
    const token = generateJwtToken(user);
    return token;
  }

  async validatePassword({ user, password }: { user: User; password: string }) {
    return bcrypt.compare(password, user.password);
  }
}

type JwtPayload = {
  user: {
    id: number;
    username: string;
  };
};

function generateJwtToken(user: User) {
  const payload: JwtPayload = {
    user: { id: user.id, username: user.username },
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY as string, {
    expiresIn: '24h',
  });
  return token;
}

export function verifyJwtToken(token: string) {
  return jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload;
}

export default new AuthService();
