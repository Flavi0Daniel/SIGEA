const EnrollmentService = require('../services/EnrollmentService');

class EnrollmentController {

  // POST /api/enrollments  — aluno matricula-se numa turma
  async enroll(req, res) {
    try {
      const { class_id } = req.body;
      const result = await EnrollmentService.enroll(req.user.id, class_id);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // GET /api/enrollments/me  — aluno vê as suas matrículas
  async getMyEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentService.getMyEnrollments(req.user.id);
      res.json({ success: true, data: enrollments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/enrollments  — admin vê todas
  async getAll(req, res) {
    try {
      const enrollments = await EnrollmentService.getAllEnrollments();
      res.json({ success: true, data: enrollments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/enrollments/class/:classId  — admin/instructor vê alunos de uma turma
  async getByClass(req, res) {
    try {
      const enrollments = await EnrollmentService.getClassEnrollments(parseInt(req.params.classId));
      res.json({ success: true, data: enrollments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // PUT /api/enrollments/:id/activate  — admin activa manualmente
  async activate(req, res) {
    try {
      const enrollment = await EnrollmentService.activate(parseInt(req.params.id));
      res.json({ success: true, data: enrollment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/enrollments/:id/cancel
  async cancel(req, res) {
    try {
      const enrollment = await EnrollmentService.cancel(
        parseInt(req.params.id),
        req.user.id,
        req.user.role
      );
      res.json({ success: true, data: enrollment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/enrollments/:id/complete  — admin/instructor marca como concluída
  async complete(req, res) {
    try {
      const enrollment = await EnrollmentService.complete(parseInt(req.params.id));
      res.json({ success: true, data: enrollment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new EnrollmentController();