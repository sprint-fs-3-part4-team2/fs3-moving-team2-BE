import { Router } from 'express';
import { getPendingReviews, submitReview } from './controller/reviewController';

const router = Router();

router.get('/pending', getPendingReviews);
router.post('/', submitReview);

export default router;
