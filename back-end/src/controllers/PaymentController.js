const PaymentService = require('../services/PaymentService');

class PaymentController {

  // GET /api/payments/me  — aluno vê os seus pagamentos
  async getMyPayments(req, res) {
    try {
      const payments = await PaymentService.getMyPayments(req.user.id);
      res.json({ success: true, data: payments.map(p => p.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/payments  — admin vê todos
  async getAll(req, res) {
    try {
      const payments = await PaymentService.getAllPayments();
      res.json({ success: true, data: payments.map(p => p.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/payments/:id/status  — verifica e sincroniza status com ProxyPay
  async checkStatus(req, res) {
    try {
      const payment = await PaymentService.checkStatus(parseInt(req.params.id), req.user);
      res.json({ success: true, data: payment.toJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // GET /api/payments/enrollment/:enrollmentId
  async getByEnrollment(req, res) {
    try {
      const payments = await PaymentService.getPaymentsByEnrollment(parseInt(req.params.enrollmentId));
      res.json({ success: true, data: payments.map(p => p.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /api/payments/:id/confirm  — admin confirma pagamento manual (cash/transferência)
  async confirmManual(req, res) {
    try {
      const payment = await PaymentService.markAsPaidManually(parseInt(req.params.id), req.body.note);
      res.json({ success: true, data: payment.toJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // POST /api/payments/webhook  — chamado pelo ProxyPay (sem autenticação JWT)
  async webhook(req, res) {
    try {
      const result = await PaymentService.processWebhook(req.body);
      res.json(result);
    } catch (err) {
      console.error('Erro no webhook ProxyPay:', err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new PaymentController();