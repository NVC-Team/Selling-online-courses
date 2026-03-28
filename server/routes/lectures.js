const router = require('express').Router();
const lectureController = require('../controllers/lectureController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get lectures for a course (optional auth for access check)
router.get('/course/:courseId', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return auth(req, res, next);
    }
    next();
}, lectureController.getLectures);

// Get single lecture
router.get('/:id', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        return auth(req, res, next);
    }
    next();
}, lectureController.getLectureById);

// Instructor routes - no file upload, just JSON body with youtube_url
router.post('/course/:courseId', auth, role('instructor', 'admin'), lectureController.createLecture);
router.put('/:id', auth, role('instructor', 'admin'), lectureController.updateLecture);
router.delete('/:id', auth, role('instructor', 'admin'), lectureController.deleteLecture);

module.exports = router;
