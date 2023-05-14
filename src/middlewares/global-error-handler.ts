import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);
  if (err instanceof z.ZodError) return res.status(400).json(err.issues);
  res.status(500).send('Server error');
}
