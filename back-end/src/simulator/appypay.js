/**
 * src/simulator/appypay.js
 *
 * Simulador da API AppyPay para desenvolvimento.
 * Respeita o contrato exacto do email da AppyPay:
 *   POST /simulator/auth
 *   POST /simulator/charges
 *   GET  /simulator/charges/:merchantTransactionId
 *
 * Números de teste (GPO / Multicaixa Express):
 *   244900000000 → Pagamento com Sucesso
 *   244900000001 → Saldo Insuficiente
 *   244900000002 → Timeout
 *   244900000003 → Pedido Rejeitado
 */

const express = require('express');
const router = express.Router();

// Armazenamento em memória das cobranças criadas
const charges = new Map();

// ─── Funções auxiliares ───────────────────────────────────────

// Gera referência de 9 dígitos (formato EMIS/Multicaixa)
function generateReference() {
  return String(Math.floor(100000000 + Math.random() * 900000000));
}

// Gera ID único de cobrança AppyPay
function generateChargeId() {
  return 'APY-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Determina o resultado com base no número de telefone de teste
function resolveOutcomeByPhone(phone) {
  const map = {
    '244900000000': { status: 'COMPLETED', error: null },
    '244900000001': { status: 'FAILED',    error: 'INSUFFICIENT_BALANCE' },
    '244900000002': { status: 'FAILED',    error: 'TIMEOUT' },
    '244900000003': { status: 'FAILED',    error: 'REJECTED_BY_CLIENT' }
  };
  return map[phone] || { status: 'PENDING', error: null };
}

// ─── POST /simulator/auth ─────────────────────────────────────
// Autentica o comerciante e devolve um Access Token fictício.
// No real: valida clientId + clientSecret e devolve JWT real.
router.post('/auth', (req, res) => {
  const { clientId, clientSecret } = req.body;

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      message: 'clientId e clientSecret são obrigatórios'
    });
  }

  // Simulador aceita qualquer credencial e devolve token fictício
  const token = 'SIMTOKEN-' + Buffer.from(`${clientId}:${Date.now()}`).toString('base64');

  res.json({
    success: true,
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: 3600
  });
});

// ─── POST /simulator/charges ──────────────────────────────────
// Cria uma cobrança (Referência Multicaixa ou GPO).
// Campos obrigatórios conforme contrato AppyPay:
//   paymentMethod, amount, merchantTransactionID
// Opcional: description, phone (para simular cenários de teste)
router.post('/charges', (req, res) => {
  const { paymentMethod, amount, merchantTransactionID, description, phone } = req.body;

  // Validações do contrato AppyPay
  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'paymentMethod é obrigatório' });
  }
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'amount inválido' });
  }
  if (!merchantTransactionID) {
    return res.status(400).json({ success: false, message: 'merchantTransactionID é obrigatório' });
  }

  // Verifica duplicação de merchantTransactionID
  if (charges.has(merchantTransactionID)) {
    return res.status(409).json({
      success: false,
      message: 'merchantTransactionID já existe. Deve ser único.'
    });
  }

  const chargeId   = generateChargeId();
  const reference  = generateReference();
  const entity     = '99999'; // Entidade EMIS de testes
  const outcome    = resolveOutcomeByPhone(phone);

  // Para GPO (Multicaixa Express): status imediato baseado no telefone
  // Para Referência: sempre PENDING (o cliente ainda não pagou)
  const isGPO      = paymentMethod === 'multicaixa_express';
  const status     = isGPO ? outcome.status : 'PENDING';

  const charge = {
    chargeId,
    merchantTransactionID,
    paymentMethod,
    amount: parseFloat(amount),
    description: description || '',
    reference,
    entity,
    status,
    error: outcome.error,
    createdAt: new Date().toISOString(),
    paidAt: status === 'COMPLETED' ? new Date().toISOString() : null
  };

  charges.set(merchantTransactionID, charge);

  res.status(201).json({
    success: true,
    data: {
      chargeId:             charge.chargeId,
      merchantTransactionID: charge.merchantTransactionID,
      paymentMethod:        charge.paymentMethod,
      amount:               charge.amount,
      reference:            charge.reference,
      entity:               charge.entity,
      status:               charge.status,
      createdAt:            charge.createdAt
    }
  });
});

// ─── GET /simulator/charges/:merchantTransactionId ────────────
// Consulta o estado de uma cobrança (dupla validação conforme AppyPay).
router.get('/charges/:merchantTransactionId', (req, res) => {
  const charge = charges.get(req.params.merchantTransactionId);

  if (!charge) {
    return res.status(404).json({
      success: false,
      message: 'Cobrança não encontrada'
    });
  }

  res.json({ success: true, data: charge });
});

// ─── POST /simulator/pay ──────────────────────────────────────
// Rota EXTRA apenas para testes manuais via Postman.
// Simula o cliente a pagar uma referência — dispara o webhook.
router.post('/pay', async (req, res) => {
  const { merchantTransactionID, phone } = req.body;
  const charge = charges.get(merchantTransactionID);

  if (!charge) {
    return res.status(404).json({ success: false, message: 'Cobrança não encontrada' });
  }

  if (charge.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: `Cobrança já está no estado ${charge.status}`
    });
  }

  const outcome = resolveOutcomeByPhone(phone || '244900000000');
  charge.status = outcome.status;
  charge.error  = outcome.error;
  charge.paidAt = outcome.status === 'COMPLETED' ? new Date().toISOString() : null;
  charges.set(merchantTransactionID, charge);

  // Dispara o webhook para o próprio backend (simula a AppyPay a notificar)
  const webhookUrl = `http://localhost:${process.env.PORT || 3000}/api/payments/webhook`;
  try {
    const axios = require('axios');
    await axios.post(webhookUrl, {
      event:                'charge.updated',
      chargeId:             charge.chargeId,
      merchantTransactionID: charge.merchantTransactionID,
      status:               charge.status,
      amount:               charge.amount,
      paidAt:               charge.paidAt,
      error:                charge.error
    });
  } catch (err) {
    console.error('[Simulador] Erro ao disparar webhook:', err.message);
  }

  res.json({
    success: true,
    message: `Pagamento simulado: ${charge.status}`,
    data: charge
  });
});

module.exports = router;