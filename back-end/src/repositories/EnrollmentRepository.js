const db = require('../config/database');
const Enrollment = require('../models/Enrollment');

class EnrollmentRepository {

  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_inscricao (student_id, class_id, status, payment_status, enrollment_date)
      VALUES (?, ?, 'pending', 'pending', NOW())
    `, [data.student_id, data.class_id]);
    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_inscricao WHERE id = ?', [id]);
    return rows[0] ? new Enrollment(rows[0]) : null;
  }

  async findByStudentId(studentId) {
    const [rows] = await db.execute(`
      SELECT i.*, t.name AS class_name, c.name AS course_name, c.duration_hours
      FROM tbl_inscricao i
      JOIN tbl_turma t ON i.class_id = t.id
      JOIN tbl_cursos c ON t.course_id = c.id
      WHERE i.student_id = ?
      ORDER BY i.enrollment_date DESC
    `, [studentId]);
    return rows.map(row => new Enrollment(row));
  }

  async findByClassId(classId) {
    const [rows] = await db.execute(`
      SELECT i.*, u.name AS student_name, u.email AS student_email, u.phone AS student_phone
      FROM tbl_inscricao i
      JOIN tbl_user u ON i.student_id = u.id
      WHERE i.class_id = ?
      ORDER BY u.name ASC
    `, [classId]);
    return rows.map(row => new Enrollment(row));
  }

  async findByStudentAndClass(studentId, classId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_inscricao WHERE student_id = ? AND class_id = ? LIMIT 1',
      [studentId, classId]
    );
    return rows[0] ? new Enrollment(rows[0]) : null;
  }

  async updateStatus(id, status) {
    await db.execute(
      'UPDATE tbl_inscricao SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  async updatePaymentStatus(id, paymentStatus) {
    await db.execute(
      'UPDATE tbl_inscricao SET payment_status = ? WHERE id = ?',
      [paymentStatus, id]
    );
    return this.findById(id);
  }

  async markCompleted(id) {
    await db.execute(
      'UPDATE tbl_inscricao SET status = "completed" WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  async countActiveInClass(classId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS total FROM tbl_inscricao WHERE class_id = ? AND status IN ("pending","active")',
      [classId]
    );
    return rows[0].total;
  }

  async findAll() {
    const [rows] = await db.execute(`
      SELECT i.*, u.name AS student_name, t.name AS class_name
      FROM tbl_inscricao i
      JOIN tbl_user u ON i.student_id = u.id
      JOIN tbl_turma t ON i.class_id = t.id
      ORDER BY i.enrollment_date DESC
    `);
    return rows.map(row => new Enrollment(row));
  }
}

module.exports = new EnrollmentRepository();