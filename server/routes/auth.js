const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, (req, res, next) => { req.uploadType = 'avatar'; next(); }, uploadImage.single('avatar'), authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
