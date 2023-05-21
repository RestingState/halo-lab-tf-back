import { Game } from '@prisma/client';
import { Server as IOServer, Socket as IOSocket } from 'socket.io';
import { Direction } from '../type';

export interface ServerToClientEvents {
  gameCreated: (game: Game) => void;
  gameStarted: (gameId: number) => void;
  turnChange: () => void;
  gameFinished: () => void;
}

export interface ClientToServerEvents {
  createGame: (
    cb: (
      res:
        | { id: number }
        | {
            error_message:
              | 'User already plays another game or waits for another game to start'
              | 'Server error';
          }
    ) => void
  ) => void;
  joinGame: (
    data: { userId: number; gameId: number },
    cb: (res: {
      error_message:
        | "User with such userId doesn't exists"
        | "Game with such gameId doesn't exists"
        | 'User already plays another game or waits for another game to start'
        | 'User already waits for this game to start'
        | 'User already plays in this game'
        | 'Server error';
    }) => void
  ) => void;
  move: (
    data: {
      userId: number;
      gameId: number;
      direction: Direction;
    },
    cb: (res: {
      error_message:
        | "User with such userId doesn't exists"
        | "Game with such gameId doesn't exists"
        | 'This direction is not allowed'
        | 'Server error';
    }) => void
  ) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  roomId: string;
  userId: number;
}

export class Server extends IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {}

export class Socket extends IOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {}
