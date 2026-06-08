const nodemailer = require('nodemailer');

// Cria o transporter usando as variáveis do .env
// Suporta Gmail, SMTP genérico ou Mailtrap (desenvolvimento)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true', // true para porta 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS   // Gmail: usar App Password
  }
});

const FROM = `"SIGEA" <${process.env.MAIL_USER}>`;

class EmailSender {

  // Email de boas-vindas ao registar
  async sendWelcome(to, name) {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Bem-vindo(a) ao SIGEA!',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>A sua conta no <strong>SIGEA</strong> foi criada com sucesso.</p>
        <p>Pode aceder à plataforma e gerir a sua formação académica.</p>
        <br>
        <p>Atenciosamente,<br><strong>Equipa SIGEA</strong></p>
      `
    });
  }

  // Email com referência de pagamento
  async sendPaymentReference(to, name, reference, amount, expiresAt) {
    const expiry = new Date(expiresAt).toLocaleDateString('pt-AO');
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Referência de Pagamento — SIGEA',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>A sua matrícula foi registada. Para activá-la, efectue o pagamento:</p>
        <table style="border-collapse:collapse; margin:16px 0;">
          <tr><td style="padding:6px 12px;font-weight:bold;">Referência:</td><td style="padding:6px 12px;">${reference}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Valor:</td><td style="padding:6px 12px;">${parseFloat(amount).toFixed(2)} AOA</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;">Válida até:</td><td style="padding:6px 12px;">${expiry}</td></tr>
        </table>
        <p>Efectue o pagamento via ATM ou iBanking.</p>
        <br>
        <p>Atenciosamente,<br><strong>Equipa SIGEA</strong></p>
      `
    });
  }

  // Email de confirmação de matrícula activa
  async sendEnrollmentConfirmation(to, name, courseName, className) {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Matrícula Confirmada — SIGEA',
      html: `
        <h2>Parabéns, ${name}!</h2>
        <p>O seu pagamento foi confirmado e a sua matrícula está agora activa.</p>
        <ul>
          <li><strong>Curso:</strong> ${courseName}</li>
          <li><strong>Turma:</strong> ${className}</li>
        </ul>
        <p>Bem-vindo(a) à formação!</p>
        <br>
        <p>Atenciosamente,<br><strong>Equipa SIGEA</strong></p>
      `
    });
  }

  // Email com certificado em anexo
  async sendCertificate(to, name, courseName, certFilePath, certNumber) {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: `Certificado de Conclusão — ${courseName}`,
      html: `
        <h2>Parabéns, ${name}! 🎓</h2>
        <p>Concluiu com sucesso o curso de <strong>${courseName}</strong>.</p>
        <p>O seu certificado (Nº ${certNumber}) encontra-se em anexo.</p>
        <br>
        <p>Atenciosamente,<br><strong>Equipa SIGEA</strong></p>
      `,
      attachments: [
        {
          filename: `certificado-${certNumber}.pdf`,
          path: certFilePath
        }
      ]
    });
  }

  // Email de recuperação de password (base para implementação futura)
  async sendPasswordReset(to, name, resetLink) {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'Recuperação de Password — SIGEA',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>Recebemos um pedido de recuperação de password para a sua conta.</p>
        <p><a href="${resetLink}" style="background:#1a3a5c;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Redefinir Password</a></p>
        <p>O link é válido por 1 hora. Se não foi você, ignore este email.</p>
        <br>
        <p>Atenciosamente,<br><strong>Equipa SIGEA</strong></p>
      `
    });
  }
}

module.exports = new EmailSender();