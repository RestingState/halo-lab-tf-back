import { PrismaClient, BoardCellValue } from '@prisma/client';
import boardService from '../src/services/board.service';
const prisma = new PrismaClient();

const boards: {
  matrix: BoardCellValue[][];
  exitCell: { x: number; y: number };
  positionsSuitableForUserStart: { x: number; y: number }[];
}[] = [
  {
    matrix: [
      ['p', 'p', 'w', 'p', 'p', 'p', 'p', 'p'],
      ['w', 'p', 'w', 'p', 'w', 'w', 'w', 'p'],
      ['p', 'p', 'w', 'p', 'p', 'w', 'p', 'p'],
      ['p', 'w', 'w', 'w', 'p', 'w', 'w', 'w'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['w', 'w', 'w', 'w', 'w', 'p', 'w', 'p'],
      ['w', 'p', 'p', 'p', 'p', 'p', 'w', 'w'],
      ['p', 'p', 'w', 'w', 'w', 'p', 'p', 'p'],
    ],
    exitCell: { x: 7, y: 7 },
    positionsSuitableForUserStart: [
      { x: 0, y: 0 },
      { x: 2, y: 6 },
    ],
  },
  {
    matrix: [
      ['p', 'w', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['p', 'p', 'p', 'p', 'w', 'p', 'p', 'p'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'w'],
      ['p', 'p', 'w', 'w', 'p', 'w', 'p', 'w'],
      ['p', 'p', 'p', 'w', 'w', 'p', 'p', 'p'],
      ['p', 'w', 'p', 'p', 'p', 'p', 'w', 'p'],
      ['p', 'w', 'p', 'p', 'p', 'p', 'w', 'p'],
      ['p', 'p', 'p', 'w', 'p', 'w', 'p', 'p'],
    ],
    exitCell: { x: 7, y: 4 },
    positionsSuitableForUserStart: [
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ],
  },
];

async function main() {
  await prisma.board.deleteMany();
  await boardService.fillBoardCells();

  for (const board of boards) {
    await boardService.createBoard(board);
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
