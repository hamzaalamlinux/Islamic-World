const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Assuming there's an admin check middleware, add it to routes requiring admin access
router.get('/users', auth, adminController.getUsers);
router.put('/approve-user/:id', auth, adminController.approveUser);
router.put('/approve-content/:id', auth, adminController.approveContent);
router.get('/get-content/:id', auth, adminController.getContentByUser);
router.post('/send-money/:id', auth, adminController.sendMoney);

module.exports = router;
