import { Game } from '@prisma/client';
import { Server as IOServer, Socket as IOSocket } from 'socket.io';
import { Direction } from '../type';

export interface ServerToClientEvents {
  gameCreated: (game: Game) => void;
  gameStarted: (gameId: number) => void;
  gameCanceled: () => void;
  turnChange: () => void;
  gameFinished: () => void;
  messageReceived: (message: {
    id: number;
    user: {
      id: number;
      username: string;
    };
    createdAt: Date;
    text: string;
  }) => void;
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
        | 'Game is not in pending state'
        | 'User already plays another game or waits for another game to start'
        | 'User already waits for this game to start'
        | 'User already plays in this game'
        | 'Server error';
    }) => void
  ) => void;
  joinGameRoom: (
    data: { gameId: number },
    cb: (res: {
      error_message: "Game with such gameId doesn't exists" | 'Server error';
    }) => void
  ) => void;
  cancelGame: (
    data: { gameId: number },
    cb: (res: {
      error_message:
        | "Game with such gameId doesn't exists"
        | 'You can only cancel game that is in pending state'
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
  giveUp: (
    data: { userId: number; gameId: number },
    cb: (res: {
      error_message:
        | "User with such userId doesn't exists"
        | "Game with such gameId doesn't exists"
        | 'Server error';
    }) => void
  ) => void;
  sendMessage: (
    data: { userId: number; gameId: number; text: string },
    cb: (res: {
      error_message:
        | "User with such userId doesn't exists"
        | "Game with such gameId doesn't exists"
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
