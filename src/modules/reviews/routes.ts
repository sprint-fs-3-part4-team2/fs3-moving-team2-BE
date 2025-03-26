import { Router } from 'express';
import * as reviewController from './controller/reviewController';
import { getSubmittedReviews } from './controller/completedController';
import { getMoverSubmittedReviews } from './controller/moverReviewController';
import { createAuthMiddleware } from '@/core/middleware/auth/auth';

const router = Router();

router.get('/pending', reviewController.getPendingReviews);
router.get('/completed/:id', getSubmittedReviews);
router.get('/mover/profile/:id', createAuthMiddleware('mover'), getMoverSubmittedReviews);
router.post('/', reviewController.submitReview);

export default router;
