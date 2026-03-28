const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Student routes
router.post('/', auth, paymentController.createPayment);
router.get('/my-payments', auth, paymentController.getMyPayments);

// Instructor routes
router.get('/instructor/pending', auth, role('instructor', 'admin'), paymentController.getInstructorPayments);
router.put('/:id/confirm', auth, role('instructor', 'admin'), paymentController.confirmPayment);
router.put('/:id/reject', auth, role('instructor', 'admin'), paymentController.rejectPayment);

module.exports = router;
