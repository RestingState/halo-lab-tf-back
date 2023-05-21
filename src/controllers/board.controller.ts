import { BoardCellValue } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import boardService from '../services/board.service';

class BoardController {
  async createBoard(req: Request, res: Response, next: NextFunction) {
    try {
      const { matrix, exitCell, positionsSuitableForUserStart } = z
        .object({
          matrix: z.array(z.array(z.nativeEnum(BoardCellValue)).min(4)).min(4),
          exitCell: z.object({ x: z.number().int(), y: z.number().int() }),
          positionsSuitableForUserStart: z
            .array(z.object({ x: z.number().int(), y: z.number().int() }))
            .min(2),
        })
        .parse(req.body);

      const board = await boardService.createBoard({
        matrix,
        exitCell,
        positionsSuitableForUserStart,
      });

      res.json(board);
    } catch (error) {
      next(error);
    }
  }

  async getBoardById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = z.number().parse(+req.params.id);

      const board = await boardService.getBoardById(id);

      res.json(board);
    } catch (error) {
      next(error);
    }
  }
}

export default new BoardController();
