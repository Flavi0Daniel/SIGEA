const express = require('express');
const router = express.Router();
const CertificateController = require('../controllers/CertificateController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Verificação pública de certificado (sem login)
router.get('/verify/:certNumber', CertificateController.verify);

// Aluno vê os seus certificados
router.get('/me', verifyToken, checkRole('student'), CertificateController.getMyCertificates);

// Download do PDF
router.get('/:id/download', verifyToken, CertificateController.download);

// Admin/Instructor gera certificado
router.post('/generate/:enrollmentId', verifyToken, checkRole('admin', 'instructor'), CertificateController.generate);

// Enviar via WhatsApp
router.post('/:id/send-whatsapp', verifyToken, checkRole('admin'), CertificateController.sendWhatsApp);

module.exports = router;