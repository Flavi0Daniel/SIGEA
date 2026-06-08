const db = require('../config/database');
const Payment = require('../models/Payment');

class PaymentRepository {

  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_pagamentos (enrollment_id, amount, payment_method, transaction_id, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [
      data.enrollment_id,
      data.amount,
      data.payment_method || 'proxypay',
      data.transaction_id || null
    ]);
    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_pagamentos WHERE id = ?', [id]);
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async findByEnrollmentId(enrollmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_pagamentos WHERE enrollment_id = ? ORDER BY created_at DESC',
      [enrollmentId]
    );
    return rows.map(row => new Payment(row));
  }

  // Busca pagamentos de um aluno via JOIN com tbl_inscricao
  async findByStudentId(studentId) {
    const [rows] = await db.execute(`
      SELECT p.*, t.name AS class_name, c.name AS course_name
      FROM tbl_pagamentos p
      JOIN tbl_inscricao i ON p.enrollment_id = i.id
      JOIN tbl_turma t ON i.class_id = t.id
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE i.student_id = ?
      ORDER BY p.created_at DESC
    `, [studentId]);
    return rows.map(row => new Payment(row));
  }

  async findByTransactionId(transactionId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_pagamentos WHERE transaction_id = ? LIMIT 1',
      [transactionId]
    );
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async markAsPaid(id, transactionId) {
    await db.execute(
      'UPDATE tbl_pagamentos SET status = "completed", transaction_id = ?, payment_date = NOW() WHERE id = ?',
      [transactionId, id]
    );
    return this.findById(id);
  }

  async markAsFailed(id) {
    await db.execute(
      'UPDATE tbl_pagamentos SET status = "failed" WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  async findPendingByEnrollment(enrollmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_pagamentos WHERE enrollment_id = ? AND status = "pending" ORDER BY created_at DESC LIMIT 1',
      [enrollmentId]
    );
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT p.*, u.name AS student_name, c.name AS course_name
      FROM tbl_pagamentos p
      JOIN tbl_inscricao i ON p.enrollment_id = i.id
      JOIN tbl_user u ON i.student_id = u.id
      JOIN tbl_turma t ON i.class_id = t.id
      JOIN tbl_cursos c ON t.course_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows.map(row => new Payment(row));
  }
}

module.exports = new PaymentRepository();