const PaymentRepository   = require('../repositories/PaymentRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const AppyPayService       = require('./AppyPayService');

class PaymentService {

  async getMyPayments(studentId) {
    return PaymentRepository.findByStudentId(studentId);
  }

  async getPaymentsByEnrollment(enrollmentId) {
    return PaymentRepository.findByEnrollmentId(enrollmentId);
  }

  async getAllPayments() {
    return PaymentRepository.findAll();
  }

  // Verifica e sincroniza o estado com a AppyPay
  async checkStatus(paymentId, requestingUser) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');

    // Aluno só pode ver os seus próprios pagamentos
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'instructor') {
      const enrollment = await EnrollmentRepository.findById(payment.enrollment_id);
      if (!enrollment || enrollment.student_id !== requestingUser.id) {
        throw new Error('Sem permissão para ver este pagamento');
      }
    }

    // Se já está concluído não precisa de consultar
    if (payment.isPaid()) return payment;

    // Consulta estado actual na AppyPay (ou simulador)
    if (payment.merchant_transaction_id) {
      try {
        const chargeData = await AppyPayService.getCharge(payment.merchant_transaction_id);
        if (chargeData.status === 'COMPLETED' && !payment.isPaid()) {
          await PaymentRepository.markAsPaid(payment.id, chargeData.chargeId);
          await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'paid');
          await EnrollmentRepository.updateStatus(payment.enrollment_id, 'active');
          return PaymentRepository.findById(paymentId);
        }
      } catch (err) {
        console.error('[PaymentService] Erro ao consultar AppyPay:', err.message);
      }
    }

    return payment;
  }

  // Admin confirma manualmente (dinheiro / transferência)
  async markAsPaidManually(paymentId) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) throw new Error('Pagamento não encontrado');
    if (payment.isPaid()) throw new Error('Este pagamento já foi confirmado');

    const updated = await PaymentRepository.markAsPaidManually(payment.id);
    await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'paid');
    await EnrollmentRepository.updateStatus(payment.enrollment_id, 'active');

    return updated;
  }

  // Webhook recebido da AppyPay (ou simulador)
  async processWebhook(data) {
    return AppyPayService.handleWebhook(data);
  }
}

module.exports = new PaymentService();