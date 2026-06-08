const db = require('../config/database');
const Certificate = require('../models/Certificate');

class CertificateRepository {

  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_certificados (enrollment_id, certificate_number, pdf_path, issue_date)
      VALUES (?, ?, ?, NOW())
    `, [
      data.enrollment_id,
      data.certificate_number,
      data.pdf_path || null
    ]);
    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_certificados WHERE id = ?', [id]);
    return rows[0] ? new Certificate(rows[0]) : null;
  }

  async findByEnrollmentId(enrollmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_certificados WHERE enrollment_id = ? LIMIT 1',
      [enrollmentId]
    );
    return rows[0] ? new Certificate(rows[0]) : null;
  }

  // Certificados de um aluno via JOIN
  async findByStudentId(studentId) {
    const [rows] = await db.execute(`
      SELECT cert.*, c.name AS course_name, t.name AS class_name
      FROM tbl_certificados cert
      JOIN tbl_inscricao i ON cert.enrollment_id = i.id
      JOIN tbl_turma t ON i.class_id = t.id
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE i.student_id = ?
      ORDER BY cert.issue_date DESC
    `, [studentId]);
    return rows.map(row => new Certificate(row));
  }

  async findByCertificateNumber(number) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_certificados WHERE certificate_number = ? LIMIT 1',
      [number]
    );
    return rows[0] ? new Certificate(rows[0]) : null;
  }

  async updatePdfPath(id, pdfPath) {
    await db.execute('UPDATE tbl_certificados SET pdf_path = ? WHERE id = ?', [pdfPath, id]);
    return this.findById(id);
  }

  async markWhatsAppSent(id) {
    await db.execute(
      'UPDATE tbl_certificados SET whatsapp_sent = 1, whatsapp_sent_at = NOW() WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  // Gera número único: SIGEA-ANO-SEQUENCIA
  async generateCertificateNumber() {
    const year = new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS total FROM tbl_certificados WHERE YEAR(issue_date) = ?',
      [year]
    );
    const seq = String(rows[0].total + 1).padStart(5, '0');
    return `SIGEA-${year}-${seq}`;
  }
}

module.exports = new CertificateRepository();