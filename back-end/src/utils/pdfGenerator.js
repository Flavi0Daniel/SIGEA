const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const CERT_DIR = path.join(process.cwd(), 'certificates');

// Garante que a pasta existe
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

class PdfGenerator {

  /**
   * Gera o PDF do certificado e devolve o caminho do ficheiro.
   * @param {Object} data
   * @param {string} data.certNumber        - ex: SIGEA-2024-00001
   * @param {string} data.studentName
   * @param {string} data.courseName
   * @param {number} data.durationHours
   * @param {string} data.className
   * @param {Date}   data.startDate
   * @param {Date}   data.endDate
   * @param {string} data.finalGrade        - média final (0-20)
   */
  async generateCertificate(data) {
    const fileName = `${data.certNumber}.pdf`;
    const filePath = path.join(CERT_DIR, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const W = doc.page.width;
      const H = doc.page.height;

      // --- Fundo ---
      doc.rect(0, 0, W, H).fill('#f9f6f0');

      // --- Borda decorativa ---
      doc.rect(20, 20, W - 40, H - 40)
        .lineWidth(3)
        .stroke('#1a3a5c');

      doc.rect(28, 28, W - 56, H - 56)
        .lineWidth(1)
        .stroke('#c9a84c');

      // --- Cabeçalho ---
      doc.fillColor('#1a3a5c')
        .fontSize(11)
        .font('Helvetica')
        .text('REPÚBLICA DE ANGOLA', 0, 50, { align: 'center' });

      doc.fontSize(22)
        .font('Helvetica-Bold')
        .text('SISTEMA DE GESTÃO ACADÉMICA — SIGEA', 0, 68, { align: 'center' });

      // --- Linha separadora ---
      doc.moveTo(80, 100).lineTo(W - 80, 100).lineWidth(1).stroke('#c9a84c');

      // --- Título ---
      doc.fillColor('#1a3a5c')
        .fontSize(36)
        .font('Helvetica-Bold')
        .text('CERTIFICADO DE CONCLUSÃO', 0, 115, { align: 'center' });

      // --- Corpo ---
      doc.fillColor('#333333')
        .fontSize(14)
        .font('Helvetica')
        .text('Certifica-se que', 0, 175, { align: 'center' });

      doc.fillColor('#1a3a5c')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text(data.studentName.toUpperCase(), 0, 198, { align: 'center' });

      doc.fillColor('#333333')
        .fontSize(14)
        .font('Helvetica')
        .text(
          `concluiu com aproveitamento o curso de`,
          0, 238, { align: 'center' }
        );

      doc.fillColor('#1a3a5c')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(data.courseName, 0, 260, { align: 'center' });

      const startFormatted = new Date(data.startDate).toLocaleDateString('pt-AO', { year: 'numeric', month: 'long' });
      const endFormatted = new Date(data.endDate).toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' });

      doc.fillColor('#333333')
        .fontSize(12)
        .font('Helvetica')
        .text(
          `Turma: ${data.className}  |  Carga horária: ${data.durationHours}h  |  Período: ${startFormatted} a ${endFormatted}`,
          0, 295, { align: 'center' }
        );

      doc.fillColor('#1a3a5c')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text(`Classificação Final: ${data.finalGrade} valores`, 0, 318, { align: 'center' });

      // --- Linha separadora inferior ---
      doc.moveTo(80, 345).lineTo(W - 80, 345).lineWidth(1).stroke('#c9a84c');

      // --- Rodapé ---
      const issueDate = new Date().toLocaleDateString('pt-AO', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      doc.fillColor('#555555')
        .fontSize(10)
        .font('Helvetica')
        .text(`Luanda, ${issueDate}`, 80, 360);

      doc.text(`Nº Certificado: ${data.certNumber}`, 0, 360, { align: 'center' });

      doc.text('Director(a) Geral', W - 200, 360, { width: 150, align: 'center' });

      // Linhas de assinatura
      doc.moveTo(80, 385).lineTo(220, 385).lineWidth(0.5).stroke('#333');
      doc.moveTo(W - 220, 385).lineTo(W - 80, 385).lineWidth(0.5).stroke('#333');

      doc.fontSize(9)
        .text('Coordenação Académica', 80, 390, { width: 140, align: 'center' })
        .text('Direcção Geral', W - 220, 390, { width: 140, align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Gera um recibo de pagamento simples em PDF.
   */
  async generatePaymentReceipt(data) {
    const fileName = `recibo-${data.paymentId}-${Date.now()}.pdf`;
    const filePath = path.join(CERT_DIR, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 60 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fillColor('#1a3a5c').fontSize(22).font('Helvetica-Bold')
        .text('SIGEA — RECIBO DE PAGAMENTO', { align: 'center' });

      doc.moveDown();
      doc.fillColor('#333').fontSize(12).font('Helvetica');
      doc.text(`Nº Recibo: REC-${String(data.paymentId).padStart(6, '0')}`);
      doc.text(`Aluno: ${data.studentName}`);
      doc.text(`Curso: ${data.courseName}`);
      doc.text(`Valor pago: ${parseFloat(data.amount).toFixed(2)} AOA`);
      doc.text(`Data: ${new Date(data.paidAt).toLocaleDateString('pt-AO')}`);
      doc.text(`Método: ${data.method}`);
      doc.text(`Referência: ${data.reference || 'N/A'}`);

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }
}

module.exports = new PdfGenerator();