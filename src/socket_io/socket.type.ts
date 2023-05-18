import { Server as IOServer, Socket as IOSocket } from 'socket.io';

export interface ServerToClientEvents {}

export interface ClientToServerEvents {}

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
