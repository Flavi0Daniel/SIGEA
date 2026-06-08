const GradeService = require('../services/GradeService');

class GradeController {

  // POST /api/grades  — instructor lança nota
  async create(req, res) {
    try {
      const grade = await GradeService.addGrade(req.body, req.user.id);
      res.status(201).json({ success: true, data: grade.toJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/grades/:id  — instructor/admin edita nota
  async update(req, res) {
    try {
      const grade = await GradeService.updateGrade(parseInt(req.params.id), req.body, req.user);
      res.json({ success: true, data: grade.toJSON() });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // DELETE /api/grades/:id  — só admin
  async delete(req, res) {
    try {
      const result = await GradeService.deleteGrade(parseInt(req.params.id), req.user);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // GET /api/grades/enrollment/:enrollmentId  — notas de uma matrícula
  async getByEnrollment(req, res) {
    try {
      const grades = await GradeService.getGradesByEnrollment(parseInt(req.params.enrollmentId));
      res.json({ success: true, data: grades.map(g => g.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/grades/class/:classId  — todas as notas de uma turma (instructor/admin)
  async getByClass(req, res) {
    try {
      const grades = await GradeService.getGradesByClass(parseInt(req.params.classId));
      res.json({ success: true, data: grades.map(g => g.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/grades/me/class/:classId  — aluno vê as suas notas numa turma
  async getMyGrades(req, res) {
    try {
      const result = await GradeService.getGradesByStudentAndClass(
        req.user.id,
        parseInt(req.params.classId)
      );
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GradeController();