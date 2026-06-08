const axios = require('axios');
const PaymentRepository = require('../repositories/PaymentRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const proxypayConfig = require('../config/proxypay');

class ProxyPayService {

  // Cria referência de pagamento no ProxyPay e regista na BD
  async createPaymentForEnrollment(enrollment) {
    // Busca o preço do curso via turma
    const db = require('../config/database');
    const [rows] = await db.execute(`
      SELECT c.price, c.name AS course_name
      FROM tbl_turma t
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE t.id = ?
    `, [enrollment.class_id]);

    if (!rows[0]) throw new Error('Não foi possível obter o valor do curso');
    const { price: amount } = rows[0];

    // Tenta gerar referência no ProxyPay
    let transactionId = null;
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + proxypayConfig.referenceValidityDays);

      const response = await axios.post(
        `${proxypayConfig.apiUrl}${proxypayConfig.endpoints.createReference}`,
        {
          amount: parseFloat(amount).toFixed(2),
          end_datetime: expiresAt.toISOString(),
          custom_fields: {
            enrollment_id: String(enrollment.id),
            student_id: String(enrollment.student_id)
          }
        },
        { headers: proxypayConfig.headers() }
      );
      transactionId = response.data?.id || null;
    } catch (err) {
      console.error('Erro ao criar referência ProxyPay:', err.response?.data || err.message);
      // Regista o pagamento mesmo sem referência
    }

    // Regista o pagamento na BD
    const payment = await PaymentRepository.create({
      enrollment_id: enrollment.id,
      amount,
      payment_method: 'proxypay',
      transaction_id: transactionId
    });

    return payment;
  }

  // Webhook chamado pelo ProxyPay quando confirma pagamento
  async handleWebhook(webhookData) {
    const { id: transactionId, status } = webhookData;

    const payment = await PaymentRepository.findByTransactionId(transactionId);
    if (!payment) {
      throw new Error(`Pagamento com transaction_id ${transactionId} não encontrado`);
    }

    if (status === 'COMPLETED' || status === 'paid') {
      await PaymentRepository.markAsPaid(payment.id, transactionId);
      await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'paid');
      await EnrollmentRepository.updateStatus(payment.enrollment_id, 'active');
      return { success: true, message: 'Pagamento confirmado e inscrição activada' };
    }

    if (status === 'FAILED' || status === 'expired') {
      await PaymentRepository.markAsFailed(payment.id);
      await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'overdue');
      return { success: false, message: 'Pagamento falhado' };
    }

    return { success: false, message: 'Status desconhecido' };
  }
}

module.exports = new ProxyPayService();