const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Suporta Evolution API (self-hosted) ou Z-API (cloud)
// Configura no .env: WHATSAPP_PROVIDER=evolution | zapi
const PROVIDER = process.env.WHATSAPP_PROVIDER || 'evolution';

const evolutionConfig = {
  baseUrl: process.env.EVOLUTION_API_URL,       // ex: http://localhost:8080
  apiKey: process.env.EVOLUTION_API_KEY,
  instance: process.env.EVOLUTION_INSTANCE      // nome da instância
};

const zapiConfig = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

class WhatsAppService {

  // Normaliza número angolano: 9XXXXXXXX → 244 9XXXXXXXX
  _normalizePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('244')) return digits;
    if (digits.startsWith('9') && digits.length === 9) return `244${digits}`;
    return digits;
  }

  // Envia mensagem de texto
  async sendMessage(phone, message) {
    const number = this._normalizePhone(phone);

    if (PROVIDER === 'evolution') {
      return this._sendEvolution(number, message);
    }
    return this._sendZApi(number, message);
  }

  // Envia certificado em PDF
  async sendCertificate(phone, filePath, studentName) {
    const number = this._normalizePhone(phone);
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    const message = `Olá ${studentName}! 🎓\nO seu certificado foi emitido com sucesso. Parabéns pela conclusão do curso!\n\n_Sistema SIGEA_`;

    if (PROVIDER === 'evolution') {
      return this._sendEvolutionDocument(number, base64, fileName, message);
    }
    return this._sendZApiDocument(number, base64, fileName, message);
  }

  // Envia notificação de matrícula aprovada
  async sendEnrollmentConfirmation(phone, studentName, courseName, className) {
    const msg =
      `Olá *${studentName}*! ✅\n\n` +
      `A sua matrícula foi confirmada.\n` +
      `📚 *Curso:* ${courseName}\n` +
      `🏫 *Turma:* ${className}\n\n` +
      `Bem-vindo(a) ao SIGEA!`;
    return this.sendMessage(phone, msg);
  }

  // Envia referência de pagamento
  async sendPaymentReference(phone, studentName, reference, amount, expiresAt) {
    const expiry = new Date(expiresAt).toLocaleDateString('pt-AO');
    const msg =
      `Olá *${studentName}*! 💳\n\n` +
      `Referência de pagamento gerada:\n` +
      `🔢 *Referência:* ${reference}\n` +
      `💰 *Valor:* ${parseFloat(amount).toFixed(2)} AOA\n` +
      `📅 *Válida até:* ${expiry}\n\n` +
      `Efectue o pagamento via ATM ou iBanking para activar a sua matrícula.`;
    return this.sendMessage(phone, msg);
  }

  // ---- Evolution API ----
  async _sendEvolution(number, message) {
    const url = `${evolutionConfig.baseUrl}/message/sendText/${evolutionConfig.instance}`;
    await axios.post(url, {
      number: `${number}@s.whatsapp.net`,
      text: message
    }, {
      headers: {
        'apikey': evolutionConfig.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async _sendEvolutionDocument(number, base64, fileName, caption) {
    const url = `${evolutionConfig.baseUrl}/message/sendMedia/${evolutionConfig.instance}`;
    await axios.post(url, {
      number: `${number}@s.whatsapp.net`,
      mediatype: 'document',
      media: base64,
      fileName,
      caption
    }, {
      headers: {
        'apikey': evolutionConfig.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // ---- Z-API ----
  async _sendZApi(number, message) {
    const url = `https://api.z-api.io/instances/${zapiConfig.instanceId}/token/${zapiConfig.token}/send-text`;
    await axios.post(url, { phone: number, message }, {
      headers: {
        'client-token': zapiConfig.clientToken,
        'Content-Type': 'application/json'
      }
    });
  }

  async _sendZApiDocument(number, base64, fileName, caption) {
    const url = `https://api.z-api.io/instances/${zapiConfig.instanceId}/token/${zapiConfig.token}/send-document/base64`;
    await axios.post(url, {
      phone: number,
      base64Document: `data:application/pdf;base64,${base64}`,
      fileName,
      caption
    }, {
      headers: {
        'client-token': zapiConfig.clientToken,
        'Content-Type': 'application/json'
      }
    });
  }
}

module.exports = new WhatsAppService();