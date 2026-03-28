const router = require('express').Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All admin routes require admin role
router.use(auth, role('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/courses', adminController.getAllCourses);
router.put('/courses/:id/status', adminController.updateCourseStatus);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);
router.get('/revenue', adminController.getRevenue);

module.exports = router;
