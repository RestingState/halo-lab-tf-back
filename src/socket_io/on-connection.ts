import userHandlers from './handlers/user.handlers';
import { Server, Socket } from './socket.type';

export default function onConnection(io: Server, socket: Socket) {
  const { roomId } = socket.handshake.query;
  socket.data.roomId = roomId as string;

  socket.join(socket.data.roomId);

  userHandlers(io, socket);
}
