import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import authService from '../services/auth.service';
import { exclude } from '../utils';

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

      const { user, token } = await authService.singup({ username, password });

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

      const validate = await authService.validatePassword({ user, password });

      if (!validate) {
        return res
          .status(400)
          .json({ message: 'Incorrect username or password' });
      }

      const token = await authService.login(user);

      return res.json({ user: exclude(user, ['password']), token });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
