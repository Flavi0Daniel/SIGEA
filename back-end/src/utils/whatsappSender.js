/**
 * whatsappSender.js
 * Wrapper simples para envio de mensagens WhatsApp.
 * Toda a lógica real está em src/services/WhatsAppService.js.
 * Este ficheiro existe para manter a convenção da pasta utils
 * e facilitar importações em qualquer parte do sistema.
 */
const WhatsAppService = require('../services/WhatsAppService');

module.exports = {
  sendMessage: (phone, message) =>
    WhatsAppService.sendMessage(phone, message),

  sendCertificate: (phone, filePath, studentName) =>
    WhatsAppService.sendCertificate(phone, filePath, studentName),

  sendEnrollmentConfirmation: (phone, studentName, courseName, className) =>
    WhatsAppService.sendEnrollmentConfirmation(phone, studentName, courseName, className),

  sendPaymentReference: (phone, studentName, reference, amount, expiresAt) =>
    WhatsAppService.sendPaymentReference(phone, studentName, reference, amount, expiresAt)
};