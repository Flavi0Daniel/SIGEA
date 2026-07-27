// src/routes/courses.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const CourseController = require('../controllers/CourseController');

// Rota PÚBLICA — landing page pode listar cursos sem token
router.get('/public', CourseController.list);

// Rota /active — cursos activos (pública também para a landing)
router.get('/active', CourseController.listActive);

// Rotas protegidas
router.get('/',              verifyToken, CourseController.list);
router.post('/',             verifyToken, checkRole('admin'), CourseController.create);
router.put('/:id',           verifyToken, checkRole('admin'), CourseController.update);
router.put('/:id/deactivate',verifyToken, checkRole('admin'), CourseController.deactivate);
router.put('/:id/reactivate',verifyToken, checkRole('admin'), CourseController.reactivate);

module.exports = router;