const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const transectionController = require('../controllers/transectionController');
const contentController = require('../controllers/ContentController');
const forgotPasswordController = require('../controllers/forgotController');
router.post('/register', userController.register);
router.post('/upload', auth, userController.uploadContent);
router.get('/wallet', auth, userController.getWallet);
router.post('/signin', userController.signIn); // Add this line for sign-in route
router.post('/create-transection', auth,transectionController.createTransection);
router.get('/get-transection', auth,transectionController.getTransectionsForUser);
router.get('/get-content/:id', auth, contentController.getContentForUser);
router.post('/forgot-password', forgotPasswordController.forgotPassword);
router.post('/reset-password', forgotPasswordController.resetPassword);

module.exports = router;
