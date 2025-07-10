const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.loginForm);
router.post('/', authController.login);
router.get('/logout', authController.logout);

module.exports = router;