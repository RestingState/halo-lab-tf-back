import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes';
import globalErrorHandler from './middlewares/global-error-handler';
import './lib/passport';
import { createServer } from 'http';
import onConnection from './socket_io/on-connection';
import { Server } from './socket_io/socket.type';
import { verifyJwtToken } from './services/auth.service';

const app = express();

app.use(cors({ origin: process.env.FRONT_URL }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);
app.use(globalErrorHandler);

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONT_URL },
  serveClient: false,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));

  const payload = verifyJwtToken(token);
  socket.data.userId = payload.user.id;
  next();
});

io.on('connection', socket => {
  onConnection(io, socket);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
