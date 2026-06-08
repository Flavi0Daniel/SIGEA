const db = require('../config/database');
const Grade = require('../models/Grade');

class GradeRepository {

  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_notas (enrollment_id, grade, attendance_percentage, observations, evaluation_date)
      VALUES (?, ?, ?, ?, NOW())
    `, [
      data.enrollment_id,
      data.grade,
      data.attendance_percentage || null,
      data.observations || null
    ]);
    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_notas WHERE id = ?', [id]);
    return rows[0] ? new Grade(rows[0]) : null;
  }

  async findByEnrollmentId(enrollmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM tbl_notas WHERE enrollment_id = ? ORDER BY evaluation_date DESC',
      [enrollmentId]
    );
    return rows.map(row => new Grade(row));
  }

  // Busca nota de um aluno numa turma via JOIN com tbl_inscricao
  async findByStudentAndClass(studentId, classId) {
    const [rows] = await db.execute(`
      SELECT n.*
      FROM tbl_notas n
      JOIN tbl_inscricao i ON n.enrollment_id = i.id
      WHERE i.student_id = ? AND i.class_id = ?
      ORDER BY n.evaluation_date DESC
    `, [studentId, classId]);
    return rows.map(row => new Grade(row));
  }

  // Todas as notas de uma turma com nome do aluno
  async findByClassId(classId) {
    const [rows] = await db.execute(`
      SELECT n.*, u.name AS student_name
      FROM tbl_notas n
      JOIN tbl_inscricao i ON n.enrollment_id = i.id
      JOIN tbl_user u ON i.student_id = u.id
      WHERE i.class_id = ?
      ORDER BY u.name ASC
    `, [classId]);
    return rows.map(row => new Grade(row));
  }

  async update(id, data) {
    await db.execute(
      'UPDATE tbl_notas SET grade = ?, attendance_percentage = ?, observations = ? WHERE id = ?',
      [data.grade, data.attendance_percentage || null, data.observations || null, id]
    );
    return this.findById(id);
  }

  // Média das notas de um aluno numa turma
  async getAverageByStudentAndClass(studentId, classId) {
    const [rows] = await db.execute(`
      SELECT AVG(n.grade) AS average
      FROM tbl_notas n
      JOIN tbl_inscricao i ON n.enrollment_id = i.id
      WHERE i.student_id = ? AND i.class_id = ?
    `, [studentId, classId]);
    return rows[0].average ? parseFloat(rows[0].average).toFixed(2) : null;
  }

  async delete(id) {
    await db.execute('DELETE FROM tbl_notas WHERE id = ?', [id]);
  }
}

module.exports = new GradeRepository();