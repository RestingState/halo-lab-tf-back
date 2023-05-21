import prisma from '../lib/prisma';
import { shuffle } from '../utils';
import chatService from './chat.service';
import { Direction, GameCell } from '../type';

class GameService {
  async createGame({
    boardId,
    creatorId,
  }: {
    boardId: number;
    creatorId: number;
  }) {
    return prisma.game.create({
      data: {
        board: { connect: { id: boardId } },
        creator: { connect: { id: creatorId } },
        users: { create: { user: { connect: { id: creatorId } } } },
      },
      include: { creator: true },
    });
  }

  async joinGame({ userId, gameId }: { userId: number; gameId: number }) {
    return prisma.game.update({
      where: { id: gameId },
      data: { users: { create: { userId } } },
    });
  }

  async startGame({ gameId }: { gameId: number }) {
    const game = await prisma.game.findFirst({
      where: { id: gameId },
      include: {
        users: { include: { user: true } },
        board: { include: { boardCells: { include: { boardCell: true } } } },
      },
    });

    if (!game) throw new Error('Game not found');

    const shuffledUsers = shuffle<(typeof game.users)[number]>(game.users);
    const initialPositions = game.board.boardCells.filter(
      ({ suitableForUserInitialPosition }) => suitableForUserInitialPosition
    );
    for (let i = 0; i < shuffledUsers.length; i++) {
      const user = shuffledUsers[i];
      const initialPosition = initialPositions[i];
      await prisma.turn.create({
        data: {
          playerTurn: 1,
          gameTurn: i + 1,
          gameId,
          playerId: user.userId,
          playerX: initialPosition.boardCell.x,
          playerY: initialPosition.boardCell.y,
          boardCells: {
            create: game.board.boardCells.map(({ boardCellId }) => {
              const visible = initialPosition.boardCellId === boardCellId;
              return { visible, boardCell: { connect: { id: boardCellId } } };
            }),
          },
        },
      });
    }

    await chatService.createChat({ gameId });
    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'in_process' },
    });
  }

  async finishGame({ winnerId, gameId }: { winnerId: number; gameId: number }) {
    const game = await prisma.game.update({
      where: { id: gameId },
      data: { status: 'finished', winner: { connect: { id: winnerId } } },
      include: { users: { include: { user: true } } },
    });

    for (const user of game.users) {
      const turn = await this.getPlayerCurrentTurn(gameId, user.userId);
      if (!turn) throw new Error("Cannot find other player's turn");

      await prisma.turn.update({
        where: { id: turn.id },
        data: { finished: true },
      });

      await prisma.turnsOnBoardCells.updateMany({
        where: { turnId: turn.id },
        data: { visible: true },
      });
    }
  }

  async gameWithIdExists(gameId: number) {
    return Boolean(
      await prisma.game.findFirst({
        where: { id: gameId },
        select: { id: true },
      })
    );
  }

  async userIsInGame(userId: number) {
    return Boolean(
      await prisma.user.findFirst({
        where: {
          id: userId,
          games: {
            some: {
              game: { OR: [{ status: 'in_process' }, { status: 'pending' }] },
            },
          },
        },
      })
    );
  }

  async getGameUserIsIn(userId: number) {
    return prisma.game.findFirst({ where: { users: { some: { userId } } } });
  }

  async getGameBoard(
    gameCellsMatrix: GameCell[][],
    playerPosition: { x: number; y: number }
  ) {
    const gameBoard = gameCellsMatrix.map(row =>
      row.map(({ boardCell, visible }) => {
        if (visible) return { id: boardCell.id, value: boardCell.value };
        else return { id: boardCell.id, value: 'h' };
      })
    );

    gameBoard[playerPosition.x][playerPosition.y].value = 'u';

    return gameBoard;
  }

  async getPlayerCurrentTurn(gameId: number, userId: number) {
    return prisma.turn.findFirst({
      where: { gameId, playerId: userId },
      orderBy: { playerTurn: 'desc' },
      include: { boardCells: { include: { boardCell: true } } },
    });
  }

  async getGameCurrentTurn() {
    return prisma.turn.findFirst({
      where: { finished: false },
      orderBy: { gameTurn: 'asc' },
    });
  }

  async getAllowedMoveDirections(
    gameCellsMatrix: GameCell[][],
    playerPosition: { x: number; y: number }
  ) {
    const { x, y } = playerPosition;
    const allowedDirections: Direction[] = [];

    if (gameCellsMatrix[x - 1] && gameCellsMatrix[x - 1][y]) {
      if (
        !gameCellsMatrix[x - 1][y].visible ||
        (gameCellsMatrix[x - 1][y].visible &&
          gameCellsMatrix[x - 1][y].boardCell.value === 'p')
      )
        allowedDirections.push('up');
    }

    if (gameCellsMatrix[x + 1] && gameCellsMatrix[x + 1][y]) {
      if (
        !gameCellsMatrix[x + 1][y].visible ||
        (gameCellsMatrix[x + 1][y].visible &&
          gameCellsMatrix[x + 1][y].boardCell.value === 'p')
      )
        allowedDirections.push('down');
    }

    if (gameCellsMatrix[x][y - 1]) {
      if (
        !gameCellsMatrix[x][y - 1].visible ||
        (gameCellsMatrix[x][y - 1].visible &&
          gameCellsMatrix[x][y - 1].boardCell.value === 'p')
      )
        allowedDirections.push('left');
    }

    if (gameCellsMatrix[x][y + 1]) {
      if (
        !gameCellsMatrix[x][y + 1].visible ||
        (gameCellsMatrix[x][y + 1].visible &&
          gameCellsMatrix[x][y + 1].boardCell.value === 'p')
      )
        allowedDirections.push('right');
    }

    return allowedDirections;
  }

  async getCellPlayerWantsToMoveOnto(
    gameCellsMatrix: GameCell[][],
    currentPlayerPosition: { x: number; y: number },
    direction: Direction
  ) {
    const { x, y } = currentPlayerPosition;
    if (direction === 'up') return gameCellsMatrix[x - 1][y];
    if (direction === 'down') return gameCellsMatrix[x + 1][y];
    if (direction === 'left') return gameCellsMatrix[x][y - 1];
    if (direction === 'right') return gameCellsMatrix[x][y + 1];
  }
}

export default new GameService();
