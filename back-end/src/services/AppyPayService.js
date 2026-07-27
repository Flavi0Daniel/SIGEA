/**
 * src/services/AppyPayService.js
 *
 * Serviço de integração com a AppyPay (usando o simulador em dev).
 * Segue o contrato exacto: Autenticação → Token → Cobrança → Webhook
 */

const axios = require('axios');


// Em desenvolvimento aponta para o simulador local.
// Em produção aponta para a API real da AppyPay.
const APPYPAY_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.APPYPAY_API_URL
  : `http://localhost:${process.env.PORT || 3000}/simulator`;

const CLIENT_ID     = process.env.APPYPAY_CLIENT_ID     || 'sigea-dev-client';
const CLIENT_SECRET = process.env.APPYPAY_CLIENT_SECRET || 'sigea-dev-secret';

// Cache do token em memória (evita autenticar a cada cobrança)
let cachedToken     = null;
let tokenExpiresAt  = null;

class AppyPayService {

  // ─── Autenticação ────────────────────────────────────────────
  // Passo 1 do contrato AppyPay: pede token com clientId + clientSecret
  async getToken() {
    // Reutiliza token se ainda for válido (com margem de 60s)
    if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60000) {
      return cachedToken;
    }

    const response = await axios.post(`${APPYPAY_BASE_URL}/auth`, {
      clientId:     CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });

    cachedToken    = response.data.accessToken;
    tokenExpiresAt = Date.now() + (response.data.expiresIn * 1000);
    return cachedToken;
  }

  // ─── Criar cobrança ──────────────────────────────────────────
  // Passo 2 do contrato AppyPay: POST /charges
  // Devolve { reference, entity, chargeId, merchantTransactionID, status }
  async createCharge({ amount, paymentMethod = 'referencia', description = '', phone = null }) {
    const token = await this.getToken();

    // merchantTransactionID deve ser ÚNICO por transação
    const merchantTransactionID = `SIGEA-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const payload = {
      paymentMethod,
      amount:               parseFloat(amount).toFixed(2),
      merchantTransactionID,
      description
    };

    // Em testes GPO, passa o telefone para simular o cenário
    if (phone && paymentMethod === 'multicaixa_express') {
      payload.phone = phone;
    }

    const response = await axios.post(
      `${APPYPAY_BASE_URL}/charges`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.data;
  }

  // ─── Consultar cobrança ──────────────────────────────────────
  // GET /charges/:merchantTransactionId — dupla validação
  async getCharge(merchantTransactionID) {
    const token = await this.getToken();

    const response = await axios.get(
      `${APPYPAY_BASE_URL}/charges/${merchantTransactionID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.data;
  }

  // ─── Criar pagamento para uma inscrição ──────────────────────
  // Chamado pelo EnrollmentService após criar a inscrição
  async createPaymentForEnrollment(enrollment) {
    const db = require('../config/database');

    // Busca o preço do curso
    const [rows] = await db.execute(`
      SELECT c.price, c.name AS course_name
      FROM tbl_turma t
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE t.id = ?
    `, [enrollment.class_id]);

    if (!rows[0]) throw new Error('Não foi possível obter o valor do curso');
    const { price: amount, course_name } = rows[0];

    // Cria cobrança na AppyPay (simulador)
    let chargeData = null;
    let merchantTransactionID = `SIGEA-${Date.now()}-FALLBACK`;

    try {
      chargeData = await this.createCharge({
        amount,
        paymentMethod: 'referencia',
        description:   `Inscrição — ${course_name}`
      });
      merchantTransactionID = chargeData.merchantTransactionID;
    } catch (err) {
      console.error('[AppyPay] Erro ao criar cobrança:', err.message);
      // Regista mesmo sem dados da AppyPay para não bloquear a inscrição
    }

    // Guarda na BD
    const PaymentRepository = require('../repositories/PaymentRepository');
    const payment = await PaymentRepository.create({
      enrollment_id:          enrollment.id,
      amount,
      payment_method:         chargeData?.paymentMethod  || 'referencia',
      merchant_transaction_id: merchantTransactionID,
      reference:              chargeData?.reference      || null,
      entity:                 chargeData?.entity         || null,
      appypay_charge_id:      chargeData?.chargeId       || null,
      status:                 chargeData?.status         || 'PENDING'
    });

    return payment;
  }

  // ─── Processar webhook ───────────────────────────────────────
  // Chamado quando a AppyPay (ou simulador) notifica o pagamento
  async handleWebhook(webhookData) {
    const { merchantTransactionID, status, chargeId } = webhookData;

    const PaymentRepository  = require('../repositories/PaymentRepository');
    const EnrollmentRepository = require('../repositories/EnrollmentRepository');

    const payment = await PaymentRepository.findByMerchantTransactionId(merchantTransactionID);
    if (!payment) {
      throw new Error(`Pagamento com merchantTransactionID ${merchantTransactionID} não encontrado`);
    }

    if (status === 'COMPLETED') {
      await PaymentRepository.markAsPaid(payment.id, chargeId || merchantTransactionID);
      await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'paid');
      await EnrollmentRepository.updateStatus(payment.enrollment_id, 'active');
      return { success: true, message: 'Pagamento confirmado e inscrição activada' };
    }

    if (status === 'FAILED' || status === 'CANCELLED') {
      await PaymentRepository.markAsFailed(payment.id);
      await EnrollmentRepository.updatePaymentStatus(payment.enrollment_id, 'overdue');
      return { success: false, message: `Pagamento ${status.toLowerCase()}` };
    }

    return { success: true, message: 'Evento recebido' };
  }
}

module.exports = new AppyPayService();