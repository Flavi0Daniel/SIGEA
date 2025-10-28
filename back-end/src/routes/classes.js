const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/ClassController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/checkRole');

// 🔍 Listar turmas ativas
router.get('/', authMiddleware, ClassController.list);

// ➕ Criar turma admin 
router.post('/', authMiddleware, roleMiddleware('admin'), ClassController.create);

// ✏️ Editar turma
router.put('/:id', authMiddleware, roleMiddleware('admin'), ClassController.update);

// 🛑 Desativar turma
router.put('/:id/deactivate', authMiddleware, roleMiddleware('admin'), ClassController.deactivate);

// ✅ Reativar turma
router.put('/:id/reactivate', authMiddleware, roleMiddleware('admin'), ClassController.reactivate);

module.exports = router;
