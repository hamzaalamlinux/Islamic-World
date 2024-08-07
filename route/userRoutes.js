const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/upload', auth, userController.uploadContent);
router.get('/wallet', auth, userController.getWallet);
router.post('/signin', userController.signIn); // Add this line for sign-in route


module.exports = router;
