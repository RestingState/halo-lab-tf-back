import gameHandler from './handlers/game.handler';
import { Server, Socket } from './socket.type';
import gameService from '../services/game.service';

export default async function onConnection(io: Server, socket: Socket) {
  const userId = socket.data.userId as number;
  const game = await gameService.getGameUserIsIn(userId);
  if (game) {
    socket.join(game.id.toString());
  }

  gameHandler(io, socket);
}
