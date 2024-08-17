const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const transectionController = require('../controllers/transectionController');
const contentController = require('../controllers/ContentController');
router.post('/register', userController.register);
router.post('/upload', auth, userController.uploadContent);
router.get('/wallet', auth, userController.getWallet);
router.post('/signin', userController.signIn); // Add this line for sign-in route
router.post('/create-transection', auth,transectionController.createTransection);
router.get('/get-transection', auth,transectionController.getTransectionsForUser);
router.get('/get-content/:id', auth, contentController.getContentForUser);

module.exports = router;
