import express from 'express';
import gameController from '../controllers/game.controller';

const router = express.Router();

router.get('/waiting_list', gameController.getAllGamesForWaitingList);
router.get('/:id/waiting_screen', gameController.getGameForWaitingScreen);
router.get('/:id/user/:userId', gameController.getGameForPlay);
router.get('/:id/chat_messages', gameController.getChatMessages);

export default router;
