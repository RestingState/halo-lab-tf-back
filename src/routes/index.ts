import express, { Request, Response } from 'express';
import authRouter from './auth.routes';
import passport from 'passport';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});
router.use('/auth', authRouter);

// authed routes
router.use(passport.authenticate('jwt', { session: false }));

export default router;
