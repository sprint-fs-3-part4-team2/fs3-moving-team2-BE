import { Router } from 'express';
import * as completedController from './controller/completedController';
import * as reviewController from './controller/reviewController';
import { getSubmittedReviews } from './controller/completedController';
const router = Router();

router.get('/pending', reviewController.getPendingReviews);
router.get('/completed/:id', getSubmittedReviews);
router.post('/', reviewController.submitReview);

export default router;
