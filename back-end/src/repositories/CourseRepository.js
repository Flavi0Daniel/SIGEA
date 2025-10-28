const db = require('../config/database');
const Course = require('../models/Course');

class CourseRepository {
  async create(data) {
    const [result] = await db.execute(`
      INSERT INTO tbl_cursos (name, description, duration_hours, price, image, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, TRUE, ?)
    `, [data.name, data.description, data.duration_hours, data.price, data.image, data.created_by]);

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tbl_cursos WHERE id = ?', [id]);
    return rows[0] ? new Course(rows[0]) : null;
  }

  async findAllActive() {
    const [rows] = await db.execute('SELECT * FROM tbl_cursos WHERE is_active = TRUE');
    return rows.map(row => new Course(row));
  }

  async deactivate(id) {
    await db.execute('UPDATE tbl_cursos SET is_active = FALSE WHERE id = ?', [id]);
  }

  async update(id, data) {
    await db.execute(`
      UPDATE tbl_cursos SET name = ?, description = ?, duration_hours = ?, price = ?, image = ?
      WHERE id = ?
    `, [data.name, data.description, data.duration_hours, data.price, data.image, id]);

    return this.findById(id);
  }

  async reactivate(id) {
    await db.execute('UPDATE tbl_cursos SET is_active = TRUE WHERE id = ?', [id]);
  }
  


}

module.exports = new CourseRepository();
