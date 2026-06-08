const CourseRepository = require('../repositories/CourseRepository');

class CourseService {

  async getAll() {
    return CourseRepository.findAll();
  }

  async getActive() {
    return CourseRepository.findActive();
  }

  async getById(id) {
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Curso não encontrado');
    return course;
  }

  async create(data) {
    // Verifica nome duplicado
    const existing = await CourseRepository.findByName(data.name);
    if (existing) throw new Error('Já existe um curso com este nome');

    return CourseRepository.create(data);
  }

  async update(id, data) {
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Curso não encontrado');

    // Verifica nome duplicado (se nome mudou)
    if (data.name && data.name !== course.name) {
      const existing = await CourseRepository.findByName(data.name);
      if (existing) throw new Error('Já existe um curso com este nome');
    }

    return CourseRepository.update(id, data);
  }

  async setActive(id, isActive) {
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Curso não encontrado');
    return CourseRepository.setActive(id, isActive);
  }

  async delete(id) {
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Curso não encontrado');
    // O repositório deve lançar erro se houver turmas associadas (FK constraint)
    await CourseRepository.delete(id);
    return { message: 'Curso eliminado com sucesso' };
  }
}

module.exports = new CourseService();