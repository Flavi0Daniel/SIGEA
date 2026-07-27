// src/controllers/CourseController.js
const CourseService = require('../services/CourseService');

class CourseController {

  // GET /api/courses — lista todos (autenticado)
  async list(req, res) {
    try {
      const courses = await CourseService.getAll();
      res.json({ success: true, data: courses });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/courses/active — lista só os activos (público)
  async listActive(req, res) {
    try {
      const courses = await CourseService.getActive();
      res.json({ success: true, data: courses });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/courses
  async create(req, res) {
    try {
      const course = await CourseService.create(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/courses/:id
  async update(req, res) {
    try {
      const course = await CourseService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, data: course });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/courses/:id/deactivate
  async deactivate(req, res) {
    try {
      await CourseService.setActive(parseInt(req.params.id), false);
      res.json({ success: true, message: 'Curso desactivado' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // PUT /api/courses/:id/reactivate
  async reactivate(req, res) {
    try {
      await CourseService.setActive(parseInt(req.params.id), true);
      res.json({ success: true, message: 'Curso activado' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new CourseController();