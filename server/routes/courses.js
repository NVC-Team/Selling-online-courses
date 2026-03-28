const router = require('express').Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadImage } = require('../middleware/upload');

// Public routes
router.get('/', courseController.getCourses);
router.get('/categories', courseController.getCategories);

// Instructor routes (must be before /:id)
router.get('/instructor/my-courses', auth, role('instructor', 'admin'), courseController.getInstructorCourses);
router.post('/', auth, role('instructor', 'admin'), uploadImage.single('thumbnail'), courseController.createCourse);

// Parameterized routes
router.get('/:id', courseController.getCourseById);
router.put('/:id', auth, role('instructor', 'admin'), uploadImage.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', auth, role('instructor', 'admin'), courseController.deleteCourse);

module.exports = router;

