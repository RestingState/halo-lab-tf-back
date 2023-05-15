import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof z.ZodError) return res.status(400).json(err.issues);
  console.error(err.stack);
  res.status(500).send('Server error');
}
