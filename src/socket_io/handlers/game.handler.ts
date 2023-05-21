import { z } from 'zod';
import prisma from '../../lib/prisma';
import boardService from '../../services/board.service';
import gameService from '../../services/game.service';
import { Server, Socket } from '../socket.type';
import userService from '../../services/user.service';

export default function gameHandler(io: Server, socket: Socket) {
  socket.on('createGame', async cb => {
    try {
      const creatorId = socket.data.userId as number;

      const userIsInGame = await gameService.userIsInGame(creatorId);
      if (userIsInGame)
        return cb({
          error_message:
            'User already plays another game or waits for another game to start',
        });

      const boardId = await boardService.getRandomBoardId();
      const game = await gameService.createGame({
        boardId,
        creatorId,
      });

      socket.join(game.id.toString());
      io.emit('gameCreated', game);
      cb({ id: game.id });
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });

  socket.on('joinGame', async (data, cb) => {
    try {
      const { userId, gameId } = z
        .object({ userId: z.number().int(), gameId: z.number().int() })
        .parse(data);

      const userExists = await userService.userWithIdExists(userId);
      if (!userExists)
        return cb({ error_message: "User with such userId doesn't exists" });

      const gameExists = await gameService.gameWithIdExists(gameId);
      if (!gameExists)
        return cb({ error_message: "Game with such gameId doesn't exists" });

      const game = await prisma.game.findFirst({
        where: { id: gameId },
        include: { users: true },
      });

      if (game) {
        const isParticipant = game.users.find(u => u.userId === userId);
        if (isParticipant) {
          if (game.status === 'pending') {
            return cb({
              error_message: 'User already waits for this game to start',
            });
          } else if (game.status === 'in_process') {
            return cb({ error_message: 'User already plays in this game' });
          }
        }
      }

      const userIsInGame = await gameService.userIsInGame(userId);
      if (userIsInGame)
        return cb({
          error_message:
            'User already plays another game or waits for another game to start',
        });

      await gameService.joinGame({ userId, gameId });
      socket.join(gameId.toString());

      await gameService.startGame({ gameId });
      io.to(gameId.toString()).emit('gameStarted', gameId);
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });

  socket.on('joinGameRoom', async (data, cb) => {
    try {
      const { gameId } = z.object({ gameId: z.number().int() }).parse(data);

      const gameExists = await gameService.gameWithIdExists(gameId);
      if (!gameExists)
        return cb({ error_message: "Game with such gameId doesn't exists" });

      socket.join(gameId.toString());
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });

  socket.on('move', async (data, cb) => {
    try {
      const { userId, gameId, direction } = z
        .object({
          userId: z.number().int(),
          gameId: z.number().int(),
          direction: z.union([
            z.literal('up'),
            z.literal('right'),
            z.literal('down'),
            z.literal('left'),
          ]),
        })
        .parse(data);

      const userExists = await userService.userWithIdExists(userId);
      if (!userExists)
        return cb({ error_message: "User with such userId doesn't exists" });

      const gameExists = await gameService.gameWithIdExists(gameId);
      if (!gameExists)
        return cb({ error_message: "Game with such gameId doesn't exists" });

      const playerCurrentTurn = await gameService.getPlayerCurrentTurn(
        gameId,
        userId
      );
      if (!playerCurrentTurn) throw new Error('Turn was not found');

      const gameCellsMatrix = await boardService.getGameCellsMatrix(
        playerCurrentTurn.boardCells
      );

      const allowedDirections = await gameService.getAllowedMoveDirections(
        gameCellsMatrix,
        {
          x: playerCurrentTurn.playerX,
          y: playerCurrentTurn.playerY,
        }
      );
      if (!allowedDirections.includes(direction))
        return cb({ error_message: 'This direction is not allowed' });

      const playerCurrentCell = playerCurrentTurn.boardCells.find(
        ({ boardCell }) =>
          boardCell.x === playerCurrentTurn.playerX &&
          boardCell.y === playerCurrentTurn.playerY
      );
      if (!playerCurrentCell)
        throw new Error('Player current cell was not found');

      const cellPlayerWantsToMoveOnto =
        await gameService.getCellPlayerWantsToMoveOnto(
          gameCellsMatrix,
          { x: playerCurrentTurn.playerX, y: playerCurrentTurn.playerY },
          direction
        );
      if (!cellPlayerWantsToMoveOnto)
        throw new Error('Cell player wants to move onto was not found');

      const nextCell =
        cellPlayerWantsToMoveOnto.boardCell.value === 'w'
          ? playerCurrentCell
          : cellPlayerWantsToMoveOnto;

      await prisma.turn.update({
        where: { id: playerCurrentTurn.id },
        data: { finished: true },
      });

      const biggestGameTurn = (
        await prisma.turn.findFirst({
          where: { gameId },
          orderBy: { gameTurn: 'desc' },
        })
      )?.gameTurn;
      if (!biggestGameTurn) throw new Error('Future game turn was not found');

      const nextTurn = await prisma.turn.create({
        data: {
          playerTurn: playerCurrentTurn.playerTurn + 1,
          gameTurn: biggestGameTurn + 1,
          gameId,
          playerId: playerCurrentTurn.playerId,
          playerX: nextCell.boardCell.x,
          playerY: nextCell.boardCell.y,
          boardCells: {
            create: playerCurrentTurn.boardCells.map(
              ({ boardCell, visible: alreadyVisible }) => {
                const visible =
                  cellPlayerWantsToMoveOnto.boardCellId === boardCell.id ||
                  alreadyVisible;
                return {
                  visible,
                  boardCell: { connect: { id: boardCell.id } },
                };
              }
            ),
          },
        },
      });

      const game = await prisma.game.findFirst({
        where: { id: gameId },
        include: { board: true },
      });
      if (!game) throw new Error('Game was not found');

      if (
        nextTurn.playerX === game.board.exitX &&
        nextTurn.playerY === game.board.exitY
      ) {
        await gameService.finishGame({ winnerId: userId, gameId });

        io.to(gameId.toString()).emit('gameFinished');
        return;
      }

      io.to(gameId.toString()).emit('turnChange');
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });

  socket.on('giveUp', async (data, cb) => {
    try {
      const { userId, gameId } = z
        .object({
          userId: z.number().int(),
          gameId: z.number().int(),
        })
        .parse(data);

      const userExists = await userService.userWithIdExists(userId);
      if (!userExists)
        return cb({ error_message: "User with such userId doesn't exists" });

      const gameExists = await gameService.gameWithIdExists(gameId);
      if (!gameExists)
        return cb({ error_message: "Game with such gameId doesn't exists" });

      const winner = await prisma.user.findFirst({
        where: { games: { some: { gameId, NOT: { userId } } } },
      });
      if (!winner) throw new Error('Winner is not found');

      await gameService.finishGame({ winnerId: winner.id, gameId });
      io.to(gameId.toString()).emit('gameFinished');
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });

  socket.on('sendMessage', async (data, cb) => {
    try {
      const { userId, gameId, text } = z
        .object({
          userId: z.number().int(),
          gameId: z.number().int(),
          text: z.string(),
        })
        .parse(data);

      const userExists = await userService.userWithIdExists(userId);
      if (!userExists)
        return cb({ error_message: "User with such userId doesn't exists" });

      const gameExists = await gameService.gameWithIdExists(gameId);
      if (!gameExists)
        return cb({ error_message: "Game with such gameId doesn't exists" });

      const message = await prisma.chatMessage.create({
        data: {
          text,
          chat: { connect: { gameId } },
          user: { connect: { id: userId } },
        },
        select: {
          id: true,
          text: true,
          user: { select: { id: true, username: true } },
          createdAt: true,
        },
      });

      io.to(gameId.toString()).emit('messageReceived', message);
    } catch (error) {
      cb({ error_message: 'Server error' });
    }
  });
}
