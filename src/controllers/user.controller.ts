import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import userService from '../services/user.service';

class UserController {
  async addUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = z
        .object({
          username: z.string().min(4).max(12),
        })
        .parse(req.body);

      await userService.addUser(username);

      res.json({ username });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
