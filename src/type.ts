import { BoardCell, TurnsOnBoardCells } from '@prisma/client';

export type GameCell = TurnsOnBoardCells & { boardCell: BoardCell };
export type Direction = 'up' | 'right' | 'down' | 'left';
