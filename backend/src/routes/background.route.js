const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('../middlewares/auth.middleware.js');

const backgroundController = require('../controllers/background.controller');

router.get('', verifyAccessToken, backgroundController.getBackgrounds);
router.put('/change', verifyAccessToken, backgroundController.updateBackground);
router.post('create', verifyAccessToken, backgroundController.createBackground);

module.exports = router;