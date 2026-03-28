const router = require('express').Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.post('/', auth, progressController.updateProgress);
router.get('/course/:courseId', auth, progressController.getCourseProgress);

module.exports = router;
