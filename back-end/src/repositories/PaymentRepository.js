const db = require('../config/database');
const Payment = require('../models/Payment');

class PaymentRepository {

  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_pagamentos
        (enrollment_id, amount, payment_method, merchant_transaction_id,
         reference, entity, appypay_charge_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.enrollment_id,
      data.amount,
      data.payment_method         || 'referencia',
      data.merchant_transaction_id || null,
      data.reference               || null,
      data.entity                  || null,
      data.appypay_charge_id       || null,
      data.status                  || 'PENDING'
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

  async findByStudentId(studentId) {
    const [rows] = await db.execute(`
      SELECT p.*, t.name AS class_name, c.name AS course_name
      FROM tbl_pagamentos p
      JOIN tbl_inscricao i ON p.enrollment_id = i.id
      JOIN tbl_turma t     ON i.class_id = t.id
      JOIN tbl_cursos c    ON t.course_id = c.id
      WHERE i.student_id = ?
      ORDER BY p.created_at DESC
    `, [studentId]);
    return rows.map(row => new Payment(row));
  }

  async findByMerchantTransactionId(merchantTransactionID) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_pagamentos WHERE merchant_transaction_id = ? LIMIT 1',
      [merchantTransactionID]
    );
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async findPendingByEnrollment(enrollmentId) {
    const [rows] = await db.execute(
      `SELECT * FROM tbl_pagamentos
       WHERE enrollment_id = ? AND status = 'PENDING'
       ORDER BY created_at DESC LIMIT 1`,
      [enrollmentId]
    );
    return rows[0] ? new Payment(rows[0]) : null;
  }

  async markAsPaid(id, transactionId) {
    await db.execute(
      `UPDATE tbl_pagamentos
       SET status = 'COMPLETED', transaction_id = ?, payment_date = NOW()
       WHERE id = ?`,
      [transactionId, id]
    );
    return this.findById(id);
  }

  async markAsFailed(id) {
    await db.execute(
      "UPDATE tbl_pagamentos SET status = 'FAILED' WHERE id = ?",
      [id]
    );
    return this.findById(id);
  }

  // Admin confirma manualmente (cash / transferência bancária)
  async markAsPaidManually(id) {
    await db.execute(
      `UPDATE tbl_pagamentos
       SET status = 'COMPLETED', payment_method = 'cash',
           transaction_id = ?, payment_date = NOW()
       WHERE id = ?`,
      [`MANUAL-${Date.now()}`, id]
    );
    return this.findById(id);
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT p.*, u.name AS student_name, c.name AS course_name
      FROM tbl_pagamentos p
      JOIN tbl_inscricao i ON p.enrollment_id = i.id
      JOIN tbl_user u      ON i.student_id = u.id
      JOIN tbl_turma t     ON i.class_id = t.id
      JOIN tbl_cursos c    ON t.course_id = c.id
      ORDER BY p.created_at DESC
    `);
    return rows.map(row => new Payment(row));
  }
}

module.exports = new PaymentRepository();