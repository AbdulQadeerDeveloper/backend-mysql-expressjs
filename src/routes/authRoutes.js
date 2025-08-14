const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const validate = require('../../utils/validation');

router.post('/signup', validate.signup, authController.signup);
router.post('/login', validate.login, authController.login);

module.exports = router;