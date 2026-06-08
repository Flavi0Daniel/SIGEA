const CertificateRepository = require('../repositories/CertificateRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const GradeRepository = require('../repositories/GradeRepository');
const PdfGenerator = require('../utils/pdfGenerator');
const WhatsAppService = require('./WhatsAppService');
const db = require('../config/database');

class CertificateService {

  async generate(enrollmentId) {
    // 1. Verifica que a inscrição está concluída
    const enrollment = await EnrollmentRepository.findById(enrollmentId);
    if (!enrollment) throw new Error('Inscrição não encontrada');
    if (enrollment.status !== 'completed') {
      throw new Error('Só é possível emitir certificado para inscrições concluídas');
    }

    // 2. Verifica se já existe certificado para esta inscrição
    const existing = await CertificateRepository.findByEnrollmentId(enrollmentId);
    if (existing) return existing;

    // 3. Calcula média final
    const average = await GradeRepository.getAverageByStudentAndClass(
      enrollment.student_id,
      enrollment.class_id
    );
    if (!average || parseFloat(average) < 10) {
      throw new Error('Nota insuficiente para emissão de certificado (mínimo 10 valores)');
    }

    // 4. Busca dados completos para o PDF
    const [info] = await db.execute(`
      SELECT
        u.name AS student_name,
        c.name AS course_name,
        c.duration_hours,
        t.name AS class_name,
        t.start_date,
        t.end_date
      FROM tbl_inscricao i
      JOIN tbl_user u ON i.student_id = u.id
      JOIN tbl_turma t ON i.class_id = t.id
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE i.id = ?
    `, [enrollmentId]);

    if (!info[0]) throw new Error('Dados do aluno/curso não encontrados');

    // 5. Gera número único
    const certNumber = await CertificateRepository.generateCertificateNumber();

    // 6. Gera o PDF
    const pdfPath = await PdfGenerator.generateCertificate({
      certNumber,
      studentName: info[0].student_name,
      courseName: info[0].course_name,
      durationHours: info[0].duration_hours,
      className: info[0].class_name,
      startDate: info[0].start_date,
      endDate: info[0].end_date,
      finalGrade: average
    });

    // 7. Regista na BD
    const certificate = await CertificateRepository.create({
      enrollment_id: enrollmentId,
      certificate_number: certNumber,
      pdf_path: pdfPath
    });

    return certificate;
  }

  async sendViaWhatsApp(certificateId) {
    const cert = await CertificateRepository.findById(certificateId);
    if (!cert) throw new Error('Certificado não encontrado');
    if (!cert.pdf_path) throw new Error('Ficheiro PDF do certificado não disponível');
    if (cert.whatsapp_sent) throw new Error('Certificado já foi enviado via WhatsApp');

    // Busca o telefone do aluno via JOIN
    const [rows] = await db.execute(`
      SELECT u.phone, u.name
      FROM tbl_inscricao i
      JOIN tbl_user u ON i.student_id = u.id
      WHERE i.id = ?
    `, [cert.enrollment_id]);

    if (!rows[0]?.phone) throw new Error('Número de telefone do aluno não disponível');

    await WhatsAppService.sendCertificate(rows[0].phone, cert.pdf_path, rows[0].name);
    await CertificateRepository.markWhatsAppSent(certificateId);

    return { success: true, message: 'Certificado enviado via WhatsApp' };
  }

  async getMyCertificates(studentId) {
    return CertificateRepository.findByStudentId(studentId);
  }

  async verify(certNumber) {
    const cert = await CertificateRepository.findByCertificateNumber(certNumber);
    if (!cert) throw new Error('Certificado não encontrado ou inválido');
    return cert;
  }
}

module.exports = new CertificateService();