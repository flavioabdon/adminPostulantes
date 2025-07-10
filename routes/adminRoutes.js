const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

router.get('/dashboard', isAuthenticated, adminController.dashboard);
router.get('/postulantes', isAuthenticated, isAdmin, adminController.postulantes);
router.get('/estadisticas', isAuthenticated, isAdmin, adminController.estadisticas);
router.post('/exportar-postulantes', isAuthenticated, isAdmin, adminController.exportarPostulantes);
router.get('/exportar-todos-excel', isAuthenticated, isAdmin, adminController.exportarTodosExcel);
module.exports = router;