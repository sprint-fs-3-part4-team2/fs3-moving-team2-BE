import { Router } from 'express';
import * as completedController from './controller/completedController'
import * as reviewController from './controller/reviewController'

const router = Router();

router.get('/pending', reviewController.getPendingReviews);
router.get('/submitted', completedController.getSubmittedReviews); 
router.post('/', reviewController.submitReview);

export default router;
