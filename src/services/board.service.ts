import prisma from '../lib/prisma';
import { BoardCellValue, BoardCell, TurnsOnBoardCells } from '@prisma/client';
import { getRandInt } from '../utils';
import { GameCell } from '../type';

class BoardService {
  async createBoard({
    matrix,
    exitCell,
    positionsSuitableForUserStart,
  }: {
    matrix: BoardCellValue[][];
    exitCell: { x: number; y: number };
    positionsSuitableForUserStart: { x: number; y: number }[];
  }) {
    const boardCells: Omit<BoardCell, 'id'>[] = [];
    for (let x = 0; x < matrix.length; x++) {
      for (let y = 0; y < matrix.length; y++) {
        boardCells.push({ x, y, value: matrix[x][y] });
      }
    }

    const fetchedBoardCells = await prisma.boardCell.findMany({
      where: { OR: boardCells },
    });

    return prisma.board.create({
      data: {
        exitX: exitCell.x,
        exitY: exitCell.y,
        boardCells: {
          create: fetchedBoardCells.map(({ id, x, y }) => {
            let suitableForUserInitialPosition = false;
            positionsSuitableForUserStart.forEach(position => {
              if (position.x === x && position.y === y)
                suitableForUserInitialPosition = true;
            });

            return {
              suitableForUserInitialPosition,
              boardCell: {
                connect: {
                  id,
                },
              },
            };
          }),
        },
      },
    });
  }

  async fillBoardCells() {
    const boardCells: Omit<BoardCell, 'id'>[] = [];
    for (const value of [BoardCellValue.w, BoardCellValue.p]) {
      for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
          boardCells.push({ x, y, value });
        }
      }
    }
    await prisma.boardCell.createMany({ data: boardCells });
  }

  async getBoardById(id: number) {
    return prisma.board.findFirst({
      where: { id },
      include: { boardCells: true },
    });
  }

  async getGameCellsMatrix(gameCells: GameCell[]) {
    const gameCellsCopy = structuredClone(gameCells);
    gameCellsCopy
      .sort((a, b) => a.boardCell.x - b.boardCell.x)
      .sort((a, b) => a.boardCell.y - b.boardCell.y);

    const rows =
      gameCellsCopy[gameCellsCopy.length - 1].boardCell.y -
      gameCellsCopy[0].boardCell.y +
      1;
    const columns =
      gameCellsCopy[gameCellsCopy.length - 1].boardCell.x -
      gameCellsCopy[0].boardCell.x +
      1;

    const matrix: GameCell[][] = Array.from({ length: rows }, () => []);
    for (let x = 0, i = 0; x < rows; x++) {
      for (let y = 0; y < columns; y++, i++) {
        matrix[y].push(gameCellsCopy[i]);
      }
    }

    return matrix;
  }

  // async getBoardValuesMatrix(boardCells: BoardCell[]) {
  //   const boardCellsMatrix = await this.getBoardCellsMatrix(boardCells);
  //   return boardCellsMatrix.map(row => row.map(({ value }) => value));
  // }

  async getRandomBoardId() {
    const boardIds = (
      await prisma.board.findMany({ select: { id: true } })
    ).map(({ id }) => id);

    return boardIds[getRandInt(0, boardIds.length)];
  }
}

export default new BoardService();
