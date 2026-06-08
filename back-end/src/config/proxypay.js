/**
 * config/proxypay.js
 * Configuração centralizada da integração com o ProxyPay Angola.
 * Documentação oficial: https://developer.proxypay.net
 */

module.exports = {
  apiUrl: process.env.PROXYPAY_API_URL || 'https://api.sandbox.proxypay.net',
  apiKey: process.env.PROXYPAY_API_KEY || '',

  // Quantos dias a referência de pagamento fica válida
  referenceValidityDays: parseInt(process.env.PROXYPAY_VALIDITY_DAYS) || 3,

  // Moeda padrão
  currency: 'AOA',

  // Headers padrão para todas as chamadas à API
  headers() {
    return {
      'Authorization': `Token ${this.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  },

  // Endpoints
  endpoints: {
    createReference: '/references',
    getReference:    (id) => `/references/${id}`,
    listPayments:    '/payments',
    getPayment:      (id) => `/payments/${id}`
  },

  // Verifica se o webhook recebido tem a assinatura correcta
  // O ProxyPay envia o header X-Proxypay-Signature
  verifyWebhookSignature(signature) {
    const expected = process.env.PROXYPAY_WEBHOOK_SECRET || '';
    return signature === expected;
  }
};