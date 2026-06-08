const CertificateService = require('../services/CertificateService');
const path = require('path');
const fs = require('fs');

class CertificateController {

  // POST /api/certificates/generate/:enrollmentId  — admin/instructor gera certificado
  async generate(req, res) {
    try {
      const cert = await CertificateService.generate(parseInt(req.params.enrollmentId));
      res.status(201).json({ success: true, data: cert.toJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // GET /api/certificates/me  — aluno vê os seus certificados
  async getMyCertificates(req, res) {
    try {
      const certs = await CertificateService.getMyCertificates(req.user.id);
      res.json({ success: true, data: certs.map(c => c.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/certificates/verify/:certNumber  — verificação pública (sem auth)
  async verify(req, res) {
    try {
      const cert = await CertificateService.verify(req.params.certNumber);
      res.json({ success: true, valid: true, data: cert.toJSON() });
    } catch (err) {
      res.status(404).json({ success: false, valid: false, message: err.message });
    }
  }

  // GET /api/certificates/:id/download  — faz download do PDF
  async download(req, res) {
    try {
      const CertificateRepository = require('../repositories/CertificateRepository');
      const cert = await CertificateRepository.findById(parseInt(req.params.id));

      if (!cert) {
        return res.status(404).json({ success: false, message: 'Certificado não encontrado' });
      }

      // Aluno só pode descarregar o seu próprio
      if (req.user.role !== 'admin' && cert.student_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      if (!cert.file_path || !fs.existsSync(cert.file_path)) {
        return res.status(404).json({ success: false, message: 'Ficheiro não disponível' });
      }

      res.download(cert.file_path, `certificado-${cert.certificate_number}.pdf`);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/certificates/:id/send-whatsapp  — envia via WhatsApp
  async sendWhatsApp(req, res) {
    try {
      const result = await CertificateService.sendViaWhatsApp(parseInt(req.params.id));
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new CertificateController();