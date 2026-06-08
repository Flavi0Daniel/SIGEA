const express = require('express');
const router = express.Router();
const GradeController = require('../controllers/GradeController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Aluno vê as suas notas numa turma
router.get('/me/class/:classId', verifyToken, checkRole('student'), GradeController.getMyGrades);

// Notas de uma matrícula
router.get('/enrollment/:enrollmentId', verifyToken, checkRole('admin', 'instructor'), GradeController.getByEnrollment);

// Todas as notas de uma turma
router.get('/class/:classId', verifyToken, checkRole('admin', 'instructor'), GradeController.getByClass);

// Lançar nota (instructor ou admin)
router.post('/', verifyToken, checkRole('admin', 'instructor'), GradeController.create);

// Editar nota
router.put('/:id', verifyToken, checkRole('admin', 'instructor'), GradeController.update);

// Eliminar nota (só admin)
router.delete('/:id', verifyToken, checkRole('admin'), GradeController.delete);

module.exports = router;