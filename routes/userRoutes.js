const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, isAdmin, userController.list);
router.get('/create', isAuthenticated, isAdmin, userController.createForm);
router.post('/create', isAuthenticated, isAdmin, userController.create);
router.get('/edit/:id', isAuthenticated, isAdmin, userController.editForm);
router.post('/update/:id', isAuthenticated, isAdmin, userController.update);
router.get('/delete/:id', isAuthenticated, isAdmin, userController.delete);
router.post('/change-password/:id', isAuthenticated, isAdmin, userController.changePassword);

module.exports = router;