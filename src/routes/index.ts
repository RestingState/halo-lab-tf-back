import express, { Request, Response } from 'express';
import userRouter from './user.routes';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Hello world');
});

router.use('/user', userRouter);

export default router;
