const PaymentRepository = require('../repositories/PaymentRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const ProxyPayService = require('./ProxyPayService');

class PaymentService {

  async getMyPayments(studentId) {
    return PaymentRepository.findByStudentId(studentId);
  }

  async getPaymentsByEnrollment(enrollmentId) {
    return PaymentRepository.findByEnrollmentId(enrollmentId);
  }

  async checkStatus(paymentId, requestingUser) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');

    // Aluno só pode ver pagamentos das suas próprias inscrições
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'instructor') {
      const enrollment = await EnrollmentRepository.findById(payment.enrollment_id);
      if (!enrollment || enrollment.student_id !== requestingUser.id) {
        throw new Error('Sem permissão para ver este pagamento');
      }
    }

    return payment;
  }

  // Admin confirma pagamento manual (dinheiro / transferência bancária)
  async markAsPaidManually(paymentId) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');
    if (payment.status === 'completed') throw new Error('Este pagamento já foi confirmado');

    const updated = await PaymentRepository.markAsPaid(payment.id, `MANUAL-${Date.now()}`);

    // Actualiza o payment_status da inscrição
    await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'paid');
    await EnrollmentRepository.updateStatus(payment.enrollment_id, 'active');

    return updated;
  }

  async getAllPayments() {
    return PaymentRepository.findAll();
  }

  // Webhook do ProxyPay
  async processWebhook(data) {
    return ProxyPayService.handleWebhook(data);
  }
}

module.exports = new PaymentService();