const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const transectionController = require('../controllers/transectionController');
const contentController = require('../controllers/ContentController');
// Assuming there's an admin check middleware, add it to routes requiring admin access
router.get('/users', auth, adminController.getUsers);
router.put('/approve-user/:id', auth, adminController.approveUser);
router.post('/send-money/:id', auth, adminController.sendMoney);
router.get('/get-transection', auth,transectionController.getTransectionsForAdmin);
router.post('/approve-transection', auth, transectionController.ApproveTransection);
router.get('/get-content/:id', auth, contentController.getContentForAdmin);
router.put('/approve-content/:id', auth, contentController.approveContent);


module.exports = router;
