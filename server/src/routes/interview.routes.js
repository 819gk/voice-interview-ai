import { Router } from 'express';
import {
  answerSchema,
  createInterview,
  createInterviewSchema,
  getInterview,
  getOptions,
  listInterviews,
  submitAnswer,
} from '../controllers/interview.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/options', getOptions);
router.get('/', listInterviews);
router.post('/', aiLimiter, validate(createInterviewSchema), createInterview);
router.get('/:id', getInterview);
router.post('/:id/answer', aiLimiter, validate(answerSchema), submitAnswer);

export default router;
