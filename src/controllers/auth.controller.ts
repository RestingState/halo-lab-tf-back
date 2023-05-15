import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

class AuthController {
  async singup(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = z
        .object({
          username: z.string().min(4).max(12),
          password: z.string().min(8).max(32),
        })
        .parse(req.body);

      const exists = await prisma.user.findFirst({ where: { username } });

      if (exists) {
        return res
          .status(400)
          .json({ message: 'User with such username already exists' });
      }

      const user = await prisma.user.create({
        data: { username, password },
      });

      const token = generateJwtToken(user);

      res.json({ user: exclude(user, ['password']), token });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = z
        .object({
          username: z.string(),
          password: z.string(),
        })
        .parse(req.body);

      const user = await prisma.user.findFirst({ where: { username } });

      if (!user) {
        return res
          .status(400)
          .json({ message: 'Incorrect username or password' });
      }

      const validate = await bcrypt.compare(password, user.password);

      if (!validate) {
        return res
          .status(400)
          .json({ message: 'Incorrect username or password' });
      }

      const token = generateJwtToken(user);

      return res.json({ user: exclude(user, ['password']), token });
    } catch (error) {
      next(error);
    }
  }
}

function generateJwtToken(user: User) {
  const body = { id: user.id, username: user.username };
  const token = jwt.sign({ user: body }, process.env.SECRET_KEY as string, {
    expiresIn: '24h',
  });
  return token;
}

function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

export default new AuthController();