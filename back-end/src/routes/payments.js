const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Webhook do ProxyPay — sem autenticação JWT (é chamado pelo servidor ProxyPay)
router.post('/webhook', PaymentController.webhook);

// Aluno vê os seus pagamentos
router.get('/me', verifyToken, checkRole('student'), PaymentController.getMyPayments);

// Admin vê todos os pagamentos
router.get('/', verifyToken, checkRole('admin'), PaymentController.getAll);

// Pagamentos de uma matrícula
router.get('/enrollment/:enrollmentId', verifyToken, checkRole('admin', 'instructor'), PaymentController.getByEnrollment);

// Verifica/sincroniza status de um pagamento
router.get('/:id/status', verifyToken, PaymentController.checkStatus);

// Admin confirma pagamento manual (dinheiro/transferência)
router.put('/:id/confirm', verifyToken, checkRole('admin'), PaymentController.confirmManual);

module.exports = router;