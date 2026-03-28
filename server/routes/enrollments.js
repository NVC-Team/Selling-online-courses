const router = require('express').Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Student routes
router.post('/', auth, enrollmentController.enroll);
router.get('/my-courses', auth, enrollmentController.getMyEnrollments);
router.put('/:id/cancel', auth, enrollmentController.cancelEnrollment);

// Instructor routes
router.get('/course/:courseId/students', auth, role('instructor', 'admin'), enrollmentController.getCourseStudents);
router.post('/course/:courseId/add-student', auth, role('instructor', 'admin'), enrollmentController.addStudent);
router.delete('/course/:courseId/student/:userId', auth, role('instructor', 'admin'), enrollmentController.removeStudent);

module.exports = router;
