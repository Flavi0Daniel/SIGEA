const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/EnrollmentController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Aluno matricula-se
router.post('/', verifyToken, checkRole('student'), EnrollmentController.enroll);

// Aluno vê as suas matrículas
router.get('/me', verifyToken, checkRole('student'), EnrollmentController.getMyEnrollments);

// Admin vê todas as matrículas
router.get('/', verifyToken, checkRole('admin'), EnrollmentController.getAll);

// Admin/Instructor vê alunos de uma turma
router.get('/class/:classId', verifyToken, checkRole('admin', 'instructor'), EnrollmentController.getByClass);

// Admin activa matrícula manualmente
router.put('/:id/activate', verifyToken, checkRole('admin'), EnrollmentController.activate);

// Aluno ou admin cancela
router.put('/:id/cancel', verifyToken, EnrollmentController.cancel);

// Admin/Instructor marca como concluída
router.put('/:id/complete', verifyToken, checkRole('admin', 'instructor'), EnrollmentController.complete);

module.exports = router;