import express from 'express';

import { askQueryHandler } from '../controllers/ai_controller';
import { verifyAccessToken } from '../middleware/user_token_middleware';

const router = express.Router();

router.post('/chat', verifyAccessToken, askQueryHandler);

export default router;
