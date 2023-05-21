import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { GameStatus } from '@prisma/client';
import boardService from '../services/board.service';
import gameService from '../services/game.service';
import userService from '../services/user.service';

class GameController {
  async getAllGamesForWaitingList(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { status } = z
        .object({ status: z.nativeEnum(GameStatus) })
        .parse({ status: req.query.status });

      const games = await prisma.game.findMany({
        where: { status },
        include: { creator: { select: { id: true, username: true } } },
      });

      res.json(games);
    } catch (error) {
      next(error);
    }
  }

  async getGameForWaitingScreen(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const gameId = z.number().int().parse(+req.params.id);

      const game = await prisma.game.findFirst({
        where: { id: gameId },
        select: { createdAt: true, creatorId: true },
      });

      res.json(game);
    } catch (error) {
      next(error);
    }
  }

  async getGameForPlay(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId, userId } = z
        .object({
          gameId: z.coerce.number().int(),
          userId: z.coerce.number().int(),
        })
        .parse({
          gameId: req.params.id,
          userId: req.params.userId,
        });

      const userExists = await userService.userWithIdExists(userId);
      if (!userExists)
        return res.status(400).json({
          error_message: "User with such userId doesn't exists",
        });

      const game = await prisma.game.findFirst({ where: { id: gameId } });
      if (!game)
        return res.status(400).json({
          error_message: "Game with such gameId doesn't exists",
        });

      const playerCurrentTurn = await gameService.getPlayerCurrentTurn(
        gameId,
        userId
      );
      if (!playerCurrentTurn) throw new Error('Turn was not found');

      const gameCellsMatrix = await boardService.getGameCellsMatrix(
        playerCurrentTurn.boardCells
      );

      const gameBoard = await gameService.getGameBoard(gameCellsMatrix, {
        x: playerCurrentTurn.playerX,
        y: playerCurrentTurn.playerY,
      });

      if (game.winnerId) {
        return res.json({
          gameBoard,
          gameFinished: true,
          youWon: game.winnerId === userId,
        });
      }

      const gameCurrentTurn = await gameService.getGameCurrentTurn();
      if (!gameCurrentTurn) throw new Error('Current turn was not found');

      const allowedDirections = await gameService.getAllowedMoveDirections(
        gameCellsMatrix,
        {
          x: playerCurrentTurn.playerX,
          y: playerCurrentTurn.playerY,
        }
      );

      res.json({
        gameBoard,
        yourTurn: gameCurrentTurn.playerId === userId,
        allowedDirections,
        gameFinished: false,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GameController();
