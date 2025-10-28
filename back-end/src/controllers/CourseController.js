const CourseRepository = require('../repositories/CourseRepository');

class CourseController {
  async create(req, res) {
    const { name, description, duration_hours, price, image } = req.body;
    const created_by = req.user.id;

    try {
      const course = await CourseRepository.create({ name, description, duration_hours, price, image, created_by });
      res.status(201).json({ success: true, data: course.toJSON() });
    } catch (err) {
      console.error('Erro ao criar curso:', err);
      res.status(500).json({ success: false, message: 'Erro ao criar curso' });
    }
  }

  async list(req, res) {
    try {
      const courses = await CourseRepository.findAllActive();
      res.json({ success: true, data: courses.map(c => c.toJSON()) });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao listar cursos' });
    }
  }

  async update(req, res) {
    const id = parseInt(req.params.id);
    const { name, description, duration_hours, price, image } = req.body;

    try {
      const updated = await CourseRepository.update(id, { name, description, duration_hours, price, image });
      res.json({ success: true, data: updated.toJSON() });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao atualizar curso' });
    }
  }

  async deactivate(req, res) {
    const id = parseInt(req.params.id);

    try {
      await CourseRepository.deactivate(id);
      res.json({ success: true, message: 'Curso desativado com sucesso' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Erro ao desativar curso' });
    }
  }

  async reactivate(req, res) {
    const id = parseInt(req.params.id);
  
    try {
      await CourseRepository.reactivate(id);
      res.json({ success: true, message: 'Curso reativado com sucesso' });
    } catch (err) {
      console.error('Erro ao reativar curso:', err);
      res.status(500).json({ success: false, message: 'Erro ao reativar curso' });
    }
  }
  


}

module.exports = new CourseController();
