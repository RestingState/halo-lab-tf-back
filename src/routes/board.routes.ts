import express from 'express';
import boardController from '../controllers/board.controller';

const router = express.Router();

router.post('/', boardController.createBoard);
router.get('/:id', boardController.getBoardById);

export default router;
