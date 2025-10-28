const db = require('../config/database');
const Class = require('../models/Class');

class ClassRepository {
  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_turma (course_id, instructor_id, name, start_date, end_date, max_students, schedule)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.course_id,
      data.instructor_id,
      data.name,
      data.start_date,
      data.end_date,
      data.max_students ?? 30,
      data.schedule ?? null
    ]);

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_turma WHERE id = ?', [id]);
    return rows[0] ? new Class(rows[0]) : null;
  }

  async findAllActive() {
    const [rows] = await db.execute('SELECT * FROM tbl_turma WHERE is_active = 1');
    return rows.map(row => new Class(row));
  }

  async update(id, data) {
    await db.execute(`
      UPDATE tbl_turma
      SET course_id = ?, instructor_id = ?, name = ?, start_date = ?, end_date = ?, max_students = ?, schedule = ?
      WHERE id = ?
    `, [
      data.course_id,
      data.instructor_id,
      data.name,
      data.start_date,
      data.end_date,
      data.max_students,
      data.schedule,
      id
    ]);

    return this.findById(id);
  }

  async deactivate(id) {
    await db.execute('UPDATE tbl_turma SET is_active = 0 WHERE id = ?', [id]);
  }

  async reactivate(id) {
    await db.execute('UPDATE tbl_turma SET is_active = 1 WHERE id = ?', [id]);
  }

  async findByInstructorId(instructorId) {
    const [rows] = await db.execute(`
      SELECT * FROM tbl_turma
      WHERE instructor_id = ? AND is_active = 1
    `, [instructorId]);
  
    return rows.map(row => new Class(row));
  }
  

}

module.exports = new ClassRepository();
