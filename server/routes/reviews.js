const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Public - get reviews for a course
router.get('/course/:courseId', reviewController.getCourseReviews);

// Auth required - create/update review
router.post('/course/:courseId', auth, reviewController.createReview);

// Auth required - delete review
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
