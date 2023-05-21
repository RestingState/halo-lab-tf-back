import express, { Request, Response } from 'express';
import authRouter from './auth.routes';
import boardRouter from './board.routes';
import gameRouter from './game.routes';
import passport from 'passport';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});
router.use('/auth', authRouter);

// authed routes
router.use(passport.authenticate('jwt', { session: false }));
router.use('/board', boardRouter);
router.use('/game', gameRouter);

export default router;
