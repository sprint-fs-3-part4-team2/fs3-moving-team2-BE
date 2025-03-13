import { Router } from 'express';
import * as reviewController from './controller/reviewController';

const router = Router();

router.get('/pending', reviewController.getPendingReviews);

export default router;
