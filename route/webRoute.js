const express = require('express');
const router = express.Router();
const contentController = require('../controllers/ContentController');
router.get('/get-content', contentController.getContentForWeb);
module.exports = router;
